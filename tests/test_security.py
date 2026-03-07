import pytest
import jwt
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from config.config import settings
from fastapi import HTTPException


def test_password_hashing():
    password = "secret_password"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(hashed, password) is True
    assert verify_password(hashed, "wrong_password") is False


def test_verify_password_invalid_hash():
    assert verify_password("invalid_hash", "password") is False


def test_create_access_token():
    data = {"sub": "user123"}
    token = create_access_token(data)
    assert isinstance(token, str)

    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    assert decoded["sub"] == "user123"
    assert "exp" in decoded


@pytest.mark.asyncio
async def test_get_current_user_success():
    user_id = "user123"
    token = create_access_token({"sub": user_id})
    result = await get_current_user(token)
    assert result == user_id


@pytest.mark.asyncio
async def test_get_current_user_missing_sub():
    token = create_access_token({"not_sub": "value"})
    with pytest.raises(HTTPException) as exc:
        await get_current_user(token)
    assert exc.value.status_code == 401
    assert exc.value.detail == "Token inválido"


@pytest.mark.asyncio
async def test_get_current_user_invalid_token():
    with pytest.raises(HTTPException) as exc:
        await get_current_user("invalid.token.here")
    assert exc.value.status_code == 401
    assert exc.value.detail == "Token expirado o inválido"
