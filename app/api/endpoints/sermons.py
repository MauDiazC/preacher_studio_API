from fastapi import APIRouter, Depends, Query, Request, BackgroundTasks

# AGREGA AISuggestionResponse AQUÍ ABAJO:
from app.schemas.sermon import (
    SermonCreate,
    SermonUpdate,
    SermonRead,
    PaginatedSermons,
    AISuggestionResponse,
)
from app.core.security import get_current_user
from app.core.db import get_db
from app.services.ai_service import ai_service
from app.repository.sermon_repository import sermon_repo
from app.core.exceptions import EntityNotFoundException, AIServiceUnavailableException
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/sermons", tags=["Sermones"])


@router.get("/", response_model=PaginatedSermons, summary="Listar todos los sermones")
async def list_sermons(
    limit: int = Query(10, ge=1, description="Límite de sermones a devolver."),
    offset: int = Query(0, ge=0, description="Número de sermones a omitir."),
    search: str | None = Query(None, description="Búsqueda por título o pasaje."),
    status: str | None = Query(None, description="Filtrar por estado."),
    from_date: str | None = Query(None, description="Filtrar desde esta fecha."),
    to_date: str | None = Query(None, description="Filtrar hasta esta fecha."),
    user_id: str = Depends(get_current_user),
):
    """
    Obtiene una lista paginada de sermones pertenecientes al pastor autenticado con soporte para filtros.
    """
    response = sermon_repo.get_all(
        user_id=user_id,
        limit=limit,
        offset=offset,
        search=search,
        status=status,
        from_date=from_date,
        to_date=to_date,
    )

    return {
        "total": response.count,
        "limit": limit,
        "offset": offset,
        "data": response.data,
    }


@router.post(
    "/", response_model=SermonRead, status_code=201, summary="Crear un nuevo sermón"
)
async def create_sermon(
    sermon: SermonCreate, db=Depends(get_db), user_id: str = Depends(get_current_user)
):
    """
    Crea un nuevo sermón. Si el perfil del pastor no existe, se crea automáticamente.
    """
    # 1. Asegurar que el perfil existe para evitar error de FK
    profile_res = db.table("profiles").select("id").eq("id", user_id).execute()
    if not profile_res.data:
        db.table("profiles").insert({"id": user_id}).execute()

    # 2. Insertar el sermón
    data = sermon.model_dump()
    data["user_id"] = user_id
    response = db.table("sermons").insert(data).execute()
    
    if not response.data:
        raise AppBaseException(status_code=500, message="Error al crear el sermón en la base de datos.")
        
    return response.data[0]


@router.get("/{sermon_id}", response_model=SermonRead, summary="Obtener un sermón por ID")
async def get_sermon(
    sermon_id: str,
    user_id: str = Depends(get_current_user),
):
    """
    Obtiene los detalles de un sermón específico.
    """
    res = sermon_repo.get_by_id(sermon_id, user_id)
    if not res.data:
        raise EntityNotFoundException(message=f"Sermón con ID {sermon_id} no encontrado.")
    return res.data


@router.patch(
    "/{sermon_id}",
    response_model=SermonRead,
    summary="Auto-guardar o actualizar sermón",
)
async def auto_save_sermon(
    sermon_id: str,
    sermon_update: SermonUpdate,
    db=Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Actualiza parcialmente los campos de un sermón. Ideal para implementaciones de auto-guardado en el frontend.
    """
    # Verificamos que el sermón pertenezca al usuario
    update_data = sermon_update.model_dump(exclude_unset=True)
    response = (
        db.table("sermons")
        .update(update_data)
        .eq("id", sermon_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        raise EntityNotFoundException(
            message=f"Sermón con ID {sermon_id} no encontrado o no pertenece al usuario."
        )

    return response.data[0]


@router.post(
    "/{sermon_id}/ai-assist",
    response_model=AISuggestionResponse,
    summary="Obtener mentoría de IA",
)
@limiter.limit("5/minute")
async def get_ai_assistance(
    request: Request,
    sermon_id: str,
    background_tasks: BackgroundTasks,
    db=Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Utiliza el motor de IA para generar un bosquejo sugerido y encontrar versículos basados en el título y notas actuales.
    """
    # 1. Usar el repositorio para buscar el sermón
    res = sermon_repo.get_by_id(sermon_id, user_id)
    if not res.data:
        raise EntityNotFoundException(message="Sermón no encontrado para asistencia.")

    sermon_data = res.data

    # 2. Obtener preferencia del pastor
    profile_res = (
        db.table("profiles")
        .select("mentorship_style")
        .eq("id", user_id)
        .single()
        .execute()
    )
    style = (
        profile_res.data.get("mentorship_style", "encouraging")
        if profile_res.data
        else "encouraging"
    )

    # 3. Llamar al servicio de Gemini
    try:
        suggestion = await ai_service.get_suggestions(
            title=sermon_data["title"], content=sermon_data["content"], style=style
        )
    except Exception as e:
        raise AIServiceUnavailableException(details=str(e))

    # 4. Guardar log de IA en segundo plano
    background_tasks.add_task(
        sermon_repo.save_history_snapshot, sermon_id, str(suggestion), "AI_LOG"
    )

    return suggestion


@router.post("/{sermon_id}/snapshot", summary="Crear punto de restauración (Snapshot)")
async def create_snapshot(
    sermon_id: str,
    background_tasks: BackgroundTasks,
    label: str = Query(
        ..., description="Etiqueta descriptiva (ej: 'Antes de revisión')"
    ),
    db=Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Guarda una versión inmutable del contenido actual del sermón en el historial.
    """
    # Obtener contenido actual
    res = (
        db.table("sermons")
        .select("content")
        .eq("id", sermon_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not res.data:
        raise EntityNotFoundException(
            message="Sermón no encontrado para crear snapshot."
        )

    # Insertar en el historial en segundo plano
    background_tasks.add_task(
        sermon_repo.save_history_snapshot, sermon_id, res.data["content"], label
    )

    return {"status": "Snapshot programado correctamente"}
