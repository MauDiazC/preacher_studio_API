from typing import Optional, Dict, Any
from app.core.db import supabase
from app.core.exceptions import AppBaseException
import uuid

class SubscriptionService:
    @staticmethod
    async def check_usage_limit(user_id: str, action_type: str = "EXEGESIS"):
        """
        Verifica si el usuario tiene créditos suficientes para realizar una acción.
        Los administradores tienen bypass ilimitado.
        """
        # 1. Obtener perfil
        res = supabase.table("profiles").select("is_admin, credits_remaining, plan_id").eq("id", user_id).single().execute()
        if not res.data:
            return False # No debería pasar si está autenticado
        
        profile = res.data
        if profile.get("is_admin"):
            return True # Admin bypass
        
        credits = profile.get("credits_remaining", 0)
        if credits <= 0:
            raise AppBaseException(
                status_code=403, 
                message="Has agotado tus créditos mensuales. Mejora tu plan para continuar."
            )
        
        return True

    @staticmethod
    async def record_usage(user_id: str, action_type: str, details: Optional[str] = None):
        """
        Registra una acción de uso y descuenta un crédito del perfil si no es admin.
        """
        # 1. Obtener perfil para ver si es admin
        res = supabase.table("profiles").select("is_admin").eq("id", user_id).single().execute()
        is_admin = res.data.get("is_admin", False) if res.data else False

        # 2. Registrar log
        log_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action_type": action_type,
            "verse_reference": details,
            "tokens_used": 0 # Podríamos integrar conteo de tokens real luego
        }
        supabase.table("usage_logs").insert(log_data).execute()

        # 3. Descontar crédito si no es admin
        if not is_admin:
            # PostgreSQL atomic decrement
            supabase.rpc("decrement_credits", {"user_uuid": user_id}).execute()

    @staticmethod
    async def get_user_plan_details(user_id: str) -> Dict[str, Any]:
        """
        Retorna los detalles del plan del usuario.
        """
        res = supabase.table("profiles").select("*, plans(*)").eq("id", user_id).single().execute()
        return res.data if res.data else {}

subscription_service = SubscriptionService()
