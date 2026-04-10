from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.core.db import supabase
from typing import Optional
import logging

# Forzamos los logs a la consola de Railway
print("--- AUTH ENDPOINT LOADED ---")

router = APIRouter(prefix="/auth", tags=["Autenticación"])

class AuthSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

@router.post("/register")
async def register(auth_data: AuthSchema):
    print(f"📥 REGISTER REQUEST RECEIVED: {auth_data.email}")
    
    # 1. Verificar si el cliente de supabase existe
    if supabase is None:
        print("❌ ERROR: Supabase client is NONE")
        raise HTTPException(status_code=500, detail="Backend configuration error: Supabase client missing")

    try:
        print("🔍 Attempting Supabase Auth Sign Up...")
        res = supabase.auth.sign_up({
            "email": auth_data.email,
            "password": auth_data.password,
            "options": {
                "data": {
                    "full_name": auth_data.full_name
                }
            }
        })
        
        print(f"✅ Supabase Auth response received for: {auth_data.email}")
        
        if not res.user:
            print("⚠️ WARNING: No user object in Supabase response")
            raise HTTPException(status_code=400, detail="Supabase registration failed - no user returned")
        
        print(f"🎉 Registration SUCCESS for ID: {res.user.id}")
        return {"message": "Success", "user_id": res.user.id}

    except Exception as e:
        print(f"💥 EXCEPTION DURING REGISTER: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.post("/login")
async def login(auth_data: AuthSchema):
    print(f"📥 LOGIN ATTEMPT: {auth_data.email}")
    try:
        res = supabase.auth.sign_in_with_password({
            "email": auth_data.email,
            "password": auth_data.password
        })
        print(f"✅ Login successful for: {auth_data.email}")
        return {
            "access_token": res.session.access_token,
            "token_type": "bearer",
            "user": {"id": res.user.id, "email": res.user.email}
        }
    except Exception as e:
        print(f"❌ LOGIN FAILED: {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/google")
async def google_login():
    """
    Genera la URL de autenticación con Google a través de Supabase.
    """
    try:
        # Nota: La redirección final debe estar configurada en el dashboard de Supabase
        res = supabase.auth.sign_in_with_oauth({
            "provider": "google",
            "options": {
                "redirect_to": settings.get("FRONTEND_URL", "http://localhost:5173")
            }
        })
        return {"url": res.url}
    except Exception as e:
        print(f"❌ GOOGLE AUTH FAILED: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
