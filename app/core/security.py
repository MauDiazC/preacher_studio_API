from datetime import datetime, timedelta
import jwt
import logging
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from argon2 import PasswordHasher
from config.config import settings
from app.core.db import supabase

logger = logging.getLogger("fastapi")

# OAuth2 scheme pointing to our internal login for docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def create_access_token(data: dict):
    # Esto sigue siendo útil si necesitas generar tokens internos
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Delegamos la validación a Supabase Auth
        # Esto manejará automáticamente ES256, HS256 y la rotación de llaves.
        res = supabase.auth.get_user(token)
        
        if not res.user:
            logger.warning("Supabase Auth: No user found for this token")
            raise HTTPException(status_code=401, detail="Token inválido o usuario no encontrado")
            
        return str(res.user.id)
        
    except Exception as e:
        logger.warning(f"JWT validation failed via Supabase: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Error de autenticación: {str(e)}")


ph = PasswordHasher()


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(hashed_password: str, plain_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except Exception:
        return False
