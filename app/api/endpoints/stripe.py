import stripe
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

# Mapeo de planes a Price IDs de Stripe (Estos deben ser configurados en el Dashboard de Stripe)
# IMPORTANTE: Reemplazar con los IDs reales de Stripe
PLAN_PRICE_MAPPING = {
    "mentor": settings.get("STRIPE_PRICE_ID_MENTOR", "price_H5ggY9KDJv7v1n"), # Ejemplo
    "ministerio": settings.get("STRIPE_PRICE_ID_MINISTERIO", "price_H5ggY9KDJv7v2m"), # Ejemplo
}

@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    payload: CreateCheckoutSessionRequest,
    user=Depends(get_current_user)
):
    """
    Crea una sesión de Stripe Checkout para un plan específico.
    """
    plan_id = payload.plan_id
    
    if plan_id not in PLAN_PRICE_MAPPING:
        raise HTTPException(status_code=400, detail="Plan no válido")

    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    "price": PLAN_PRICE_MAPPING[plan_id],
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url=settings.get("FRONTEND_URL", "http://localhost:5173") + "/sermons?payment=success",
            cancel_url=settings.get("FRONTEND_URL", "http://localhost:5173") + "/pricing",
            client_reference_id=str(user.id),
            customer_email=user.email,
            metadata={
                "plan_id": plan_id
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
    Maneja checkout.session.completed para actualizar créditos del usuario.
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
    
    elif event["type"] == "invoice.paid":
        # Renovación mensual exitosa
        invoice = event["data"]["object"]
        await handle_invoice_paid(invoice)
        
    elif event["type"] == "invoice.payment_failed":
        # Fallo en el cobro de la mensualidad
        invoice = event["data"]["object"]
        await handle_invoice_payment_failed(invoice)

    elif event["type"] == "customer.subscription.deleted":
        # Suscripción cancelada o terminada
        subscription = event["data"]["object"]
        await handle_subscription_deleted(subscription)

    return {"status": "success"}

async def get_credits_for_plan(plan_id: str) -> int:
    """Retorna la cantidad de créditos según el plan."""
    credits_map = {
        "free": 3,
        "plan_sembrador": 3,
        "mentor": 30,
        "ministerio": 9999,
    }
    return credits_map.get(plan_id, 3)

async def handle_checkout_session(session):
    """
    Lógica para actualizar el perfil del usuario tras una compra inicial exitosa.
    """
    user_id = session.get("client_reference_id")
    customer_id = session.get("customer")
    plan_id = session.get("metadata", {}).get("plan_id")

    if not user_id:
        logger.error(f"❌ Webhook checkout.session.completed sin client_reference_id")
        return

    new_credits = await get_credits_for_plan(plan_id)

    try:
        supabase.table("profiles").update({
            "stripe_customer_id": customer_id,
            "plan_id": plan_id,
            "credits_remaining": new_credits,
            "last_payment_date": "now()"
        }).eq("id", user_id).execute()
        logger.info(f"🚀 Perfil inicializado tras compra: {user_id} (Plan: {plan_id})")
    except Exception as e:
        logger.error(f"❌ Error actualizando perfil en handle_checkout_session: {e}")

async def handle_invoice_paid(invoice):
    """
    Maneja la renovación de créditos cuando se paga una factura (recurrente).
    """
    customer_id = invoice.get("customer")
    subscription_id = invoice.get("subscription")
    
    if not subscription_id:
        return # No es una suscripción

    try:
        # 1. Buscar al usuario por su customer_id de Stripe
        res = supabase.table("profiles").select("id, plan_id").eq("stripe_customer_id", customer_id).execute()
        if not res.data:
            logger.error(f"❌ No se encontró usuario para el customer_id: {customer_id}")
            return

        user = res.data[0]
        user_id = user["id"]
        plan_id = user["plan_id"]
        
        # 2. Recargar créditos según su plan actual
        new_credits = await get_credits_for_plan(plan_id)
        
        supabase.table("profiles").update({
            "credits_remaining": new_credits,
            "last_payment_date": "now()"
        }).eq("id", user_id).execute()
        
        logger.info(f"🔄 Créditos renovados para {user_id} por pago de factura.")
    except Exception as e:
        logger.error(f"❌ Error en handle_invoice_paid: {e}")

async def handle_invoice_payment_failed(invoice):
    """
    Maneja fallos de pago. Podrías notificar al usuario aquí.
    """
    customer_id = invoice.get("customer")
    logger.warning(f"⚠️ Pago fallido para el cliente: {customer_id}. La suscripción podría entrar en mora.")

async def handle_subscription_deleted(subscription):
    """
    Maneja la cancelación de la suscripción.
    """
    customer_id = subscription.get("customer")
    try:
        # Degradamos al usuario al plan gratuito
        supabase.table("profiles").update({
            "plan_id": "plan_sembrador",
            "credits_remaining": 3
        }).eq("stripe_customer_id", customer_id).execute()
        logger.info(f"📉 Suscripción terminada para cliente {customer_id}. Degradado a plan_sembrador.")
    except Exception as e:
        logger.error(f"❌ Error en handle_subscription_deleted: {e}")
