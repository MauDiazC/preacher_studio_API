import stripe
from fastapi import APIRouter, Request, Header, HTTPException
from config.config import settings
from app.core.db import supabase
from app.core.logger import logger

router = APIRouter(prefix="/stripe", tags=["Pagos"])

# Configuración de Stripe
stripe.api_key = settings.get("STRIPE_SECRET_KEY")
webhook_secret = settings.get("STRIPE_WEBHOOK_SECRET")

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

    return {"status": "success"}

async def handle_checkout_session(session):
    """
    Lógica para actualizar el perfil del usuario tras una compra exitosa.
    """
    user_id = session.get("client_reference_id")
    customer_email = session.get("customer_details", {}).get("email")
    
    # Intentar obtener el plan del producto o de los metadatos
    # Por ahora, mapearemos según el monto o metadatos si están disponibles
    metadata = session.get("metadata", {})
    plan_id = metadata.get("plan_id", "plan_mentor") # Default a mentor si no viene

    if not user_id:
        logger.error(f"❌ Webhook recibido sin client_reference_id. Email: {customer_email}")
        return

    logger.info(f"✅ Pago exitoso detectado para usuario: {user_id}. Plan: {plan_id}")

    # Determinar créditos según el plan (Valores ejemplo, ajustar según GEMINI.md)
    credits_map = {
        "plan_sembrador": 3,
        "plan_mentor": 30,
        "plan_ministerio": 9999, # Ilimitado simbólico
    }
    
    new_credits = credits_map.get(plan_id, 30)

    # Actualizar Supabase
    try:
        res = supabase.table("profiles").update({
            "plan_id": plan_id,
            "credits_remaining": new_credits,
            "last_payment_date": "now()" # Opcional: registrar fecha
        }).eq("id", user_id).execute()
        
        if res.data:
            logger.info(f"🚀 Créditos actualizados exitosamente para {user_id}")
        else:
            logger.error(f"❌ No se encontró perfil para actualizar: {user_id}")
            
    except Exception as e:
        logger.error(f"❌ Error actualizando perfil en Supabase: {e}")
