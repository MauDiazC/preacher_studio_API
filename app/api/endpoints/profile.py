from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.core.db import supabase
from app.schemas.sermon import ProfileRead, ProfileUpdate
from app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/profile", tags=["Perfil"])


@router.get("/", response_model=ProfileRead, summary="Obtener perfil del pastor")
async def get_profile(user=Depends(get_current_user)):
    user_id = str(user.id)
    res = supabase.table("profiles").select("*").eq("id", user_id).execute()
    
    profile_data = {
        "id": user_id,
        "email": user.email,
        "full_name": user.user_metadata.get("full_name") or user.user_metadata.get("name")
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
    res = supabase.table("profiles").update(data).eq("id", user_id).execute()
    if not res.data:
        raise EntityNotFoundException(message="Perfil no encontrado para actualizar.")
    return res.data[0]
