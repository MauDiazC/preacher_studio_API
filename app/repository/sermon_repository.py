from typing import Any, cast
from app.core.db import supabase
from app.schemas.sermon import SermonCreate, SermonUpdate


class SermonRepository:
    def __init__(self):
        self.table = "sermons"

    def get_all(
        self,
        user_id: str,
        limit: int,
        offset: int,
        search: str | None = None,
        status: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
    ):
        query = (
            supabase.table(self.table)
            .select("*", count=cast(Any, "exact"))
            .eq("user_id", user_id)
        )

        if search:
            # Búsqueda simple en título o pasaje principal
            query = query.or_(
                f"title.ilike.%{search}%,main_passage.ilike.%{search}%,content.ilike.%{search}%"
            )

        if status:
            query = query.eq("status", status)

        if from_date:
            query = query.gte("created_at", from_date)

        if to_date:
            query = query.lte("created_at", to_date)

        return (
            query.order("updated_at", desc=True)  # type: ignore
            .range(offset, offset + limit - 1)
            .execute()
        )

    def get_by_id(self, sermon_id: str, user_id: str):
        return (
            supabase.table(self.table)
            .select("*")
            .eq("id", sermon_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

    def create(self, user_id: str, sermon: SermonCreate):
        data = sermon.model_dump()
        data["user_id"] = user_id
        return supabase.table(self.table).insert(data).execute()

    def update(self, sermon_id: str, user_id: str, sermon_update: SermonUpdate):
        update_data = sermon_update.model_dump(exclude_unset=True)
        return (
            supabase.table(self.table)
            .update(update_data)
            .eq("id", sermon_id)
            .eq("user_id", user_id)
            .execute()
        )

    def delete(self, sermon_id: str, user_id: str):
        return (
            supabase.table(self.table)
            .delete()
            .eq("id", sermon_id)
            .eq("user_id", user_id)
            .execute()
        )

    # Para la traza/historial
    def save_history_snapshot(self, sermon_id: str, content: str, label: str):
        return (
            supabase.table("sermon_history")
            .insert(
                {
                    "sermon_id": sermon_id,
                    "content_snapshot": content,
                    "version_label": label,
                }
            )
            .execute()
        )


# Instancia para inyectar en las rutas
sermon_repo = SermonRepository()
