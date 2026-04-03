from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.core.security import create_access_token
from app.core.db import supabase
from typing import Optional
import logging

logger = logging.getLogger("fastapi")

router = APIRouter(prefix="/auth", tags=["Autenticación"])

class AuthSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

@router.post("/register")
async def register(auth_data: AuthSchema):
    # Registro en Supabase Auth
    try:
        logger.info(f"Attempting register for: {auth_data.email}")
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
            logger.error("Supabase registration failed - no user returned")
            raise HTTPException(status_code=400, detail="Error al registrar usuario en Supabase")
        
        logger.info(f"User registered successfully: {res.user.id}")
        return {"message": "Usuario registrado con éxito. Verifique su correo.", "user_id": res.user.id}
    except Exception as e:
        logger.error(f"💥 Critical error during registration: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error en el registro: {str(e)}")

@router.post("/login")
async def login(auth_data: AuthSchema):
    # Login en Supabase Auth
    try:
        res = supabase.auth.sign_in_with_password({
            "email": auth_data.email,
            "password": auth_data.password
        })
    except Exception as e:
        # Extraer el mensaje de error real si es posible
        error_msg = str(e)
        if "Email not confirmed" in error_msg:
            raise HTTPException(status_code=401, detail="El correo electrónico no ha sido confirmado.")
        raise HTTPException(status_code=401, detail=f"Error de autenticación: {error_msg}")

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
