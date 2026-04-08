from typing import Any, cast
from app.schemas.sermon import SermonCreate, SermonUpdate


class SermonRepository:
    def __init__(self):
        self.table = "sermons"

    def get_all(
        self,
        db: Any,
        user_id: str,
        limit: int,
        offset: int,
        search: str | None = None,
        status: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
    ):
        # Eliminamos el count="exact" explícito que a veces rompe la generación de JSON en Supabase
        # si hay columnas con tipos complejos como arrays o JSON
        query = (
            db.table(self.table)
            .select("*")
            .eq("user_id", user_id)
        )

        if search:
            query = query.or_(
                f"title.ilike.%{search}%,main_passage.ilike.%{search}%,content.ilike.%{search}%"
            )

        if status:
            query = query.eq("status", status)

        if from_date:
            query = query.gte("created_at", from_date)

        if to_date:
            query = query.lte("created_at", to_date)

        # Ordenar por updated_at (con fallback a created_at si es null)
        return (
            query.order("updated_at", desc=True, nullsfirst=False)
            .range(offset, offset + limit - 1)
            .execute()
        )

    def get_by_id(self, db: Any, sermon_id: str, user_id: str):
        return (
            db.table(self.table)
            .select("*")
            .eq("id", sermon_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

    def create(self, db: Any, user_id: str, sermon: SermonCreate):
        data = sermon.model_dump()
        data["user_id"] = user_id
        return db.table(self.table).insert(data).execute()

    def update(self, db: Any, sermon_id: str, user_id: str, sermon_update: SermonUpdate):
        update_data = sermon_update.model_dump(exclude_unset=True)
        return (
            db.table(self.table)
            .update(update_data)
            .eq("id", sermon_id)
            .eq("user_id", user_id)
            .execute()
        )

    def delete(self, db: Any, sermon_id: str, user_id: str):
        return (
            db.table(self.table)
            .delete()
            .eq("id", sermon_id)
            .eq("user_id", user_id)
            .execute()
        )

    # Para la traza/historial
    def save_history_snapshot(self, db: Any, sermon_id: str, content: str, label: str):
        return (
            db.table("sermon_history")
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
