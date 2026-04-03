from supabase import create_client, Client
from config.config import settings
import logging

logger = logging.getLogger("fastapi")

url = settings.get("SUPABASE_URL")
key = settings.get("SUPABASE_KEY")

if not url or not key:
    logger.error("❌ ERROR: SUPABASE_URL o SUPABASE_KEY no configuradas en settings/env")
    # No levantamos excepción aquí para permitir que la app inicie y muestre el error en logs
    supabase = None 
else:
    supabase: Client = create_client(url, key)


def get_db():
    if supabase is None:
        raise Exception("Cliente de Supabase no inicializado. Verifique variables de entorno.")
    return supabase
