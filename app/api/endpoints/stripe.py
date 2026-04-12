import stripe
import datetime
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from config.config import settings
from app.core.db import supabase
from app.core.logger import logger
from app.core.security import get_current_user
from app.schemas.stripe import CreateCheckoutSessionRequest, CheckoutSessionResponse

router = APIRouter(prefix="/stripe", tags=["Pagos"])

# Configuración de Stripe
stripe.api_key = settings.get("STRIPE_SECRET_KEY")
webhook_secret = settings.get("STRIPE_WEBHOOK_SECRET")

# Mapeo de IDs del Frontend/Stripe a IDs de la Base de Datos
PLAN_ID_MAP = {
    "mentor": "plan_mentor",
    "ministerio": "plan_exegeta",
    "plan_sembrador": "plan_sembrador"
}

# Mapeo de planes a Price IDs de Stripe
PLAN_PRICE_MAPPING = {
    "mentor": settings.get("STRIPE_PRICE_ID_MENTOR", "price_H5ggY9KDJv7v1n"),
    "ministerio": settings.get("STRIPE_PRICE_ID_MINISTERIO", "price_H5ggY9KDJv7v2m"),
}

# Mapeo inverso para webhooks (Price ID -> Frontend Plan ID)
REVERSE_PLAN_PRICE_MAPPING = {v: k for k, v in PLAN_PRICE_MAPPING.items()}

@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    payload: CreateCheckoutSessionRequest,
    user=Depends(get_current_user)
):
    """
    Crea una sesión de Stripe Checkout para un plan específico.
    """
    frontend_plan_id = payload.plan_id
    
    if frontend_plan_id not in PLAN_PRICE_MAPPING:
        raise HTTPException(status_code=400, detail="Plan no válido")

    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    "price": PLAN_PRICE_MAPPING[frontend_plan_id],
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url=settings.get("FRONTEND_URL", "http://localhost:5173") + "/sermons?payment=success",
            cancel_url=settings.get("FRONTEND_URL", "http://localhost:5173") + "/pricing",
            client_reference_id=str(user.id),
            customer_email=user.email,
            metadata={
                "plan_id": frontend_plan_id
            }
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        logger.error(f"❌ Error creando sesión de Stripe: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-portal-session")
async def create_portal_session(user=Depends(get_current_user)):
    """
    Crea una sesión para el Portal de Clientes de Stripe.
    """
    try:
        # Buscar el customer_id en el perfil
        res = supabase.table("profiles").select("stripe_customer_id").eq("id", user.id).single().execute()
        customer_id = res.data.get("stripe_customer_id") if res.data else None

        if not customer_id:
            raise HTTPException(status_code=400, detail="No tienes una suscripción activa para gestionar.")

        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=settings.get("FRONTEND_URL", "http://localhost:5173") + "/settings",
        )
        return {"url": portal_session.url}
    except Exception as e:
        logger.error(f"❌ Error creando portal de Stripe: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Webhook para procesar eventos de Stripe.
    """
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, webhook_secret
        )
    except ValueError as e:
        logger.error(f"⚠️ Error de payload en webhook: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"⚠️ Error de firma en webhook: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Manejar el evento
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await handle_checkout_session(session)

    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        await handle_subscription_updated(subscription)

    elif event["type"] == "invoice.paid":
        invoice = event["data"]["object"]
        await handle_invoice_paid(invoice)
        
    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        await handle_invoice_payment_failed(invoice)

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await handle_subscription_deleted(subscription)

    return {"status": "success"}

async def get_credits_for_plan(db_plan_id: str) -> int:
    """Retorna la cantidad de créditos según el plan (ID de base de datos)."""
    credits_map = {
        "plan_sembrador": 3,
        "plan_mentor": 50,
        "plan_exegeta": 9999,
    }
    return credits_map.get(db_plan_id, 3)

async def handle_checkout_session(session):
    """
    Lógica para actualizar el perfil del usuario tras una compra inicial exitosa.
    """
    user_id = session.get("client_reference_id")
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")
    metadata = session.get("metadata", {})
    frontend_plan_id = metadata.get("plan_id")
    db_plan_id = PLAN_ID_MAP.get(frontend_plan_id, "plan_sembrador")

    logger.info(f"🔔 Procesando checkout.session.completed para User: {user_id}, Plan: {db_plan_id}")

    if not user_id:
        logger.error(f"❌ Webhook checkout.session.completed SIN client_reference_id.")
        return

    subscription_end = None
    if subscription_id:
        try:
            sub = stripe.Subscription.retrieve(subscription_id)
            subscription_end = datetime.datetime.fromtimestamp(sub.current_period_end, tz=datetime.timezone.utc).isoformat()
        except Exception as e:
            logger.error(f"⚠️ No se pudo obtener info de suscripción {subscription_id}: {e}")

    new_credits = await get_credits_for_plan(db_plan_id)

    try:
        update_data = {
            "stripe_customer_id": customer_id,
            "plan_id": db_plan_id,
            "credits_remaining": new_credits,
            "last_payment_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "subscription_status": "active"
        }
        if subscription_end:
            update_data["subscription_end"] = subscription_end

        res = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        
        if res.data:
            logger.info(f"🚀 PERFIL ACTUALIZADO EXITOSAMENTE: {user_id} -> {db_plan_id}")
        else:
            logger.error(f"❌ NO SE ENCONTRÓ PERFIL: {user_id}")
            
    except Exception as e:
        logger.error(f"❌ ERROR CRÍTICO en handle_checkout_session: {e}")

async def handle_subscription_updated(subscription):
    """
    Maneja upgrades/downgrades desde el portal de Stripe o cambios en la suscripción.
    """
    customer_id = subscription.get("customer")
    price_id = subscription.get("items").data[0].price.id
    frontend_plan_id = REVERSE_PLAN_PRICE_MAPPING.get(price_id, "plan_sembrador")
    db_plan_id = PLAN_ID_MAP.get(frontend_plan_id, "plan_sembrador")
    status = subscription.get("status")
    subscription_end = datetime.datetime.fromtimestamp(subscription.current_period_end, tz=datetime.timezone.utc).isoformat()

    logger.info(f"🔄 Actualizando suscripción para cliente {customer_id} a plan {db_plan_id} (Status: {status})")

    try:
        res = supabase.table("profiles").select("id").eq("stripe_customer_id", customer_id).execute()
        if not res.data:
            logger.error(f"❌ No se encontró usuario para customer_id: {customer_id}")
            return

        user_id = res.data[0]["id"]
        new_credits = await get_credits_for_plan(db_plan_id)

        supabase.table("profiles").update({
            "plan_id": db_plan_id,
            "credits_remaining": new_credits,
            "subscription_status": status,
            "subscription_end": subscription_end
        }).eq("id", user_id).execute()

        logger.info(f"✅ Suscripción actualizada para {user_id}")
    except Exception as e:
        logger.error(f"❌ Error en handle_subscription_updated: {e}")

async def handle_invoice_paid(invoice):
    """
    Maneja la renovación de créditos cuando se paga una factura (recurrente).
    """
    customer_id = invoice.get("customer")
    subscription_id = invoice.get("subscription")
    
    if not subscription_id:
        return

    try:
        sub = stripe.Subscription.retrieve(subscription_id)
        subscription_end = datetime.datetime.fromtimestamp(sub.current_period_end, tz=datetime.timezone.utc).isoformat()

        res = supabase.table("profiles").select("id, plan_id").eq("stripe_customer_id", customer_id).execute()
        if not res.data:
            logger.error(f"❌ No se encontró usuario para customer_id: {customer_id}")
            return

        user = res.data[0]
        user_id = user["id"]
        db_plan_id = user["plan_id"]
        new_credits = await get_credits_for_plan(db_plan_id)
        
        supabase.table("profiles").update({
            "credits_remaining": new_credits,
            "last_payment_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "subscription_end": subscription_end,
            "subscription_status": "active"
        }).eq("id", user_id).execute()
        
        logger.info(f"🔄 Créditos renovados para {user_id}")
    except Exception as e:
        logger.error(f"❌ Error en handle_invoice_paid: {e}")

async def handle_invoice_payment_failed(invoice):
    """
    Maneja fallos de pago.
    """
    customer_id = invoice.get("customer")
    logger.warning(f"⚠️ Pago fallido para cliente: {customer_id}")
    try:
        supabase.table("profiles").update({
            "subscription_status": "past_due"
        }).eq("stripe_customer_id", customer_id).execute()
    except Exception as e:
        logger.error(f"❌ Error al marcar suscripción como mora: {e}")

async def handle_subscription_deleted(subscription):
    """
    Maneja la cancelación de la suscripción.
    """
    customer_id = subscription.get("customer")
    try:
        supabase.table("profiles").update({
            "plan_id": "plan_sembrador",
            "credits_remaining": 3,
            "subscription_status": "canceled",
            "subscription_end": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }).eq("stripe_customer_id", customer_id).execute()
        logger.info(f"📉 Suscripción terminada para {customer_id}")
    except Exception as e:
        logger.error(f"❌ Error en handle_subscription_deleted: {e}")
