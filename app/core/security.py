from datetime import datetime, timedelta
import jwt
import logging
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from argon2 import PasswordHasher
from config.config import settings

logger = logging.getLogger("fastapi")

# OAuth2 scheme pointing to our internal login for docs, 
# but it will handle Supabase tokens.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Debug: Ver qué algoritmo trae el header del token sin validar la firma aún
        header = jwt.get_unverified_header(token)
        logger.info(f"JWT Header: {header}")

        # Supabase puede usar HS256 o HS512 según la longitud del secreto.
        # Permitimos ambos para máxima compatibilidad.
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=["HS256", "HS512"],
            options={"verify_aud": False}
        )
        sub = payload.get("sub")
        if sub is None:
            logger.warning("JWT validation failed: Missing 'sub' claim")
            raise HTTPException(status_code=401, detail="Token sin identificador de usuario")
        return str(sub)
    except jwt.ExpiredSignatureError:
        logger.warning("JWT validation failed: Token expired")
        raise HTTPException(status_code=401, detail="El token ha expirado")
    except jwt.InvalidSignatureError:
        logger.error("JWT validation failed: Invalid signature. Check if SECRET_KEY matches Supabase JWT Secret.")
        raise HTTPException(status_code=401, detail="Firma de token inválida")
    except jwt.PyJWTError as e:
        header = jwt.get_unverified_header(token) if token else {}
        logger.warning(f"JWT validation failed: {str(e)} | Alg in token: {header.get('alg')}")
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")


ph = PasswordHasher()


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(hashed_password: str, plain_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except Exception:
        return False
