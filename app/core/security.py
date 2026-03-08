from datetime import datetime, timedelta
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from argon2 import PasswordHasher
from config.config import settings

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
        # Validamos contra la SECRET_KEY (que debe ser el JWT Secret de Supabase en producción)
        # Ignoramos la audiencia si es necesario, ya que Supabase usa 'authenticated'
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=401, detail="Token sin identificador de usuario")
        return str(sub)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="El token ha expirado")
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")


ph = PasswordHasher()


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(hashed_password: str, plain_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except Exception:
        return False
