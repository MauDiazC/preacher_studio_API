from supabase import create_client, Client
from config.config import settings

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def get_db():
    return supabase
