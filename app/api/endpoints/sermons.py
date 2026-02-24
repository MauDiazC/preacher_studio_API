from fastapi import APIRouter, Depends, Query, HTTPException
# AGREGA AISuggestionResponse AQUÍ ABAJO:
from app.schemas.sermon import (
    SermonCreate, 
    SermonUpdate, 
    SermonRead, 
    PaginatedSermons, 
    AISuggestionResponse
)
from app.core.security import get_current_user
from app.core.db import get_db
from typing import List
from app.services.ai_service import ai_service
from app.repository.sermon_repository import sermon_repo

router = APIRouter(prefix="/sermons", tags=["Sermons"])

@router.get("/", response_model=PaginatedSermons)
async def list_sermons(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    db = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    # Lógica de persistencia (Repository)
    response = db.table("sermons").select("*", count="exact")\
        .eq("user_id", user_id)\
        .range(offset, offset + limit - 1).execute()
    
    return {
        "total": response.count,
        "limit": limit,
        "offset": offset,
        "data": response.data
    }

@router.post("/", response_model=SermonRead)
async def create_sermon(
    sermon: SermonCreate, 
    db = Depends(get_db), 
    user_id: str = Depends(get_current_user)
):
    data = sermon.model_dump()
    data["user_id"] = user_id
    response = db.table("sermons").insert(data).execute()
    return response.data[0]

@router.patch("/{sermon_id}", response_model=SermonRead)
async def auto_save_sermon(
    sermon_id: str,
    sermon_update: SermonUpdate,
    db = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    # Verificamos que el sermón pertenezca al usuario
    update_data = sermon_update.model_dump(exclude_unset=True)
    response = db.table("sermons").update(update_data)\
        .eq("id", sermon_id).eq("user_id", user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Sermón no encontrado")
    
    return response.data[0]

@router.post("/{sermon_id}/ai-assist", response_model=AISuggestionResponse)
async def get_ai_assistance(
    sermon_id: str,
    user_id: str = Depends(get_current_user)
):
    # 1. Usar el repositorio para buscar el sermón
    res = sermon_repo.get_by_id(sermon_id, user_id)
    if not res.data:
        raise HTTPException(status_code=404, detail="Sermón no encontrado")
    
    sermon_data = res.data
    
    # 2. Llamar al servicio de Gemini
    suggestion = await ai_service.get_sermon_suggestions(
        title=sermon_data["title"],
        content=sermon_data["content"]
    )
    
    # 3. (Opcional) Puedes crear un método en el repo para guardar logs de IA
    sermon_repo.save_ai_log(sermon_id, suggestion)
    
    return suggestion

@router.post("/{sermon_id}/snapshot")
async def create_snapshot(
    sermon_id: str,
    label: str = Query(..., description="Ej: Borrador Final"),
    db = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    # Obtener contenido actual
    res = db.table("sermons").select("content").eq("id", sermon_id).single().execute()
    
    # Insertar en el historial
    snapshot = {
        "sermon_id": sermon_id,
        "content_snapshot": res.data["content"],
        "version_label": label
    }
    db.table("sermon_history").insert(snapshot).execute()
    return {"status": "Snapshot guardado correctamente"}