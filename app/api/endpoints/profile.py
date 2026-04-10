from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.core.db import supabase
from app.schemas.sermon import ProfileRead, ProfileUpdate
from app.core.exceptions import EntityNotFoundException
from postgrest.exceptions import APIError

router = APIRouter(prefix="/profile", tags=["Perfil"])


@router.get("/", response_model=ProfileRead, summary="Obtener perfil del pastor")
async def get_profile(user=Depends(get_current_user)):
    user_id = str(user.id)
    
    try:
        res = supabase.table("profiles").select("*").eq("id", user_id).execute()
    except APIError as e:
        # Si la columna 'bio' o similares no existen aún en el cache de PostgREST
        if "PGRST204" in str(e) or "column" in str(e).lower():
            # Intentamos traer solo lo básico que sabemos que existe
            res = supabase.table("profiles").select("id, full_name, email, credits_remaining, is_admin, plan_id").eq("id", user_id).execute()
        else:
            raise e
    
    meta = user.user_metadata or {}
    full_name = meta.get("full_name") or meta.get("name") or meta.get("display_name")
    
    profile_data = {
        "id": user_id,
        "email": user.email,
        "full_name": full_name
    }

    if not res.data:
        # Si no existe, lo creamos con los datos del usuario
        res = supabase.table("profiles").insert(profile_data).execute()
        return res.data[0]
    
    # Si existe, nos aseguramos de que email/nombre estén actualizados si eran NULL
    if not res.data[0].get("email") or not res.data[0].get("full_name"):
        res = supabase.table("profiles").update(profile_data).eq("id", user_id).execute()
        
    return res.data[0]


@router.put("/", response_model=ProfileRead, summary="Actualizar perfil")
async def update_profile(
    profile_update: ProfileUpdate, user=Depends(get_current_user)
):
    user_id = str(user.id)
    data = profile_update.model_dump(exclude_unset=True)
    try:
        res = supabase.table("profiles").update(data).eq("id", user_id).execute()
    except APIError as e:
        if "PGRST204" in str(e):
            # Si falla por columnas nuevas, intentamos guardar solo lo que el esquema actual permite
            # Esto es temporal hasta que Supabase refresque el cache
            safe_data = {k: v for k, v in data.items() if k not in ["bio", "ministry_name", "role_title", "country", "mentorship_style"]}
            res = supabase.table("profiles").update(safe_data).eq("id", user_id).execute()
        else:
            raise e
            
    if not res.data:
        raise EntityNotFoundException(message="Perfil no encontrado para actualizar.")
    return res.data[0]
