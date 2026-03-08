from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.core.security import create_access_token
from app.core.db import supabase
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Autenticación"])

class AuthSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

@router.post("/register")
async def register(auth_data: AuthSchema):
    # Registro en Supabase Auth
    res = supabase.auth.sign_up({
        "email": auth_data.email,
        "password": auth_data.password,
        "options": {
            "data": {
                "full_name": auth_data.full_name
            }
        }
    })
    
    if not res.user:
        raise HTTPException(status_code=400, detail="Error al registrar usuario")
    
    return {"message": "Usuario registrado con éxito. Verifique su correo.", "user_id": res.user.id}

@router.post("/login")
async def login(auth_data: AuthSchema):
    # Login en Supabase Auth
    try:
        res = supabase.auth.sign_in_with_password({
            "email": auth_data.email,
            "password": auth_data.password
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if not res.session:
        raise HTTPException(status_code=401, detail="No se pudo iniciar sesión")
    
    # Retornamos el access token de Supabase para que el front lo use
    return {
        "access_token": res.session.access_token,
        "token_type": "bearer",
        "user": {
            "id": res.user.id,
            "email": res.user.email,
            "full_name": res.user.user_metadata.get("full_name") if res.user.user_metadata else None
        }
    }
