from supabase import create_client, Client
from config.config import settings
import logging

logger = logging.getLogger("fastapi")

# Inicialización segura
SUPABASE_URL = settings.get("SUPABASE_URL")
SUPABASE_KEY = settings.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ CRITICAL ERROR: Supabase environment variables missing!")
    supabase = None
else:
    # Creamos el cliente directamente
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_db():
    if supabase is None:
        raise Exception("Supabase client not initialized")
    return supabase
