from typing import Optional, Dict, Any
from app.core.db import supabase
from app.core.exceptions import AppBaseException
import uuid

class SubscriptionService:
    @staticmethod
    async def check_usage_limit(user_id: str, action_type: str = "EXEGESIS", email: Optional[str] = None):
        """
        Verifica si el usuario tiene créditos o es admin. 
        Si el perfil no existe, lo crea automáticamente.
        """
        # 0. Bypass total para el desarrollador por email
        if email == "mdiazcabr@gmail.com":
            return True

        # 1. Intentar obtener perfil
        res = supabase.table("profiles").select("is_admin, credits_remaining, plan_id").eq("id", user_id).execute()
        
        if not res.data:
            print(f"🆕 Creating missing profile for user: {user_id} ({email})")
            # Si no existe, lo creamos con el plan sembrador por defecto
            new_profile = {
                "id": user_id,
                "email": email,
                "plan_id": "plan_sembrador",
                "credits_remaining": 3,
                "is_admin": False
            }
            res = supabase.table("profiles").insert(new_profile).execute()
            profile = res.data[0]
        else:
            profile = res.data[0]
        
        # 2. Bypass para administradores (basado en DB)
        if profile.get("is_admin"):
            return True
        
        # 3. Validar créditos
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
        Registra la acción y descuenta crédito si no es admin.
        """
        res = supabase.table("profiles").select("is_admin").eq("id", user_id).single().execute()
        is_admin = res.data.get("is_admin", False) if res.data else False

        log_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action_type": action_type,
            "verse_reference": details,
            "tokens_used": 0
        }
        supabase.table("usage_logs").insert(log_data).execute()

        if not is_admin:
            # Llamamos a la función RPC que creamos en la migración
            supabase.rpc("decrement_credits", {"user_uuid": user_id}).execute()

    @staticmethod
    async def get_user_plan_details(user_id: str) -> Dict[str, Any]:
        res = supabase.table("profiles").select("*, plans(*)").eq("id", user_id).execute()
        return res.data[0] if res.data else {}

subscription_service = SubscriptionService()
