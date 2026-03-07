from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.core.db import supabase
from app.schemas.sermon import ProfileRead, ProfileUpdate
from app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/profile", tags=["Perfil"])


@router.get("/", response_model=ProfileRead, summary="Obtener perfil del pastor")
async def get_profile(user_id: str = Depends(get_current_user)):
    res = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not res.data:
        # Si no existe, lo creamos (esto puede pasar tras el primer login)
        res = supabase.table("profiles").insert({"id": user_id}).execute()
        return res.data[0]
    return res.data[0]


@router.put("/", response_model=ProfileRead, summary="Actualizar perfil")
async def update_profile(
    profile_update: ProfileUpdate, user_id: str = Depends(get_current_user)
):
    data = profile_update.model_dump(exclude_unset=True)
    res = supabase.table("profiles").update(data).eq("id", user_id).execute()
    if not res.data:
        raise EntityNotFoundException(message="Perfil no encontrado para actualizar.")
    return res.data[0]
