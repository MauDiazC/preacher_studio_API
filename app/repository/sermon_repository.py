from uuid import UUID
from typing import List, Optional
from app.core.db import supabase
from app.schemas.sermon import SermonCreate, SermonUpdate

class SermonRepository:
    def __init__(self):
        self.table = "sermons"

    def get_all(self, user_id: str, limit: int, offset: int):
        return supabase.table(self.table).select("*", count="exact")\
            .eq("user_id", user_id)\
            .range(offset, offset + limit - 1).execute()

    def get_by_id(self, sermon_id: str, user_id: str):
        return supabase.table(self.table).select("*")\
            .eq("id", sermon_id)\
            .eq("user_id", user_id)\
            .single().execute()

    def create(self, user_id: str, sermon: SermonCreate):
        data = sermon.model_dump()
        data["user_id"] = user_id
        return supabase.table(self.table).insert(data).execute()

    def update(self, sermon_id: str, user_id: str, sermon_update: SermonUpdate):
        update_data = sermon_update.model_dump(exclude_unset=True)
        return supabase.table(self.table).update(update_data)\
            .eq("id", sermon_id)\
            .eq("user_id", user_id).execute()

    def delete(self, sermon_id: str, user_id: str):
        return supabase.table(self.table).delete()\
            .eq("id", sermon_id)\
            .eq("user_id", user_id).execute()

    # Para la traza/historial
    def save_history_snapshot(self, sermon_id: str, content: str, label: str):
        return supabase.table("sermon_history").insert({
            "sermon_id": sermon_id,
            "content_snapshot": content,
            "version_label": label
        }).execute()

# Instancia para inyectar en las rutas
sermon_repo = SermonRepository()