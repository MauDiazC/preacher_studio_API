from fastapi import APIRouter
import time

router = APIRouter(tags=["System"])


@router.get("/ping")
async def ping():
    return {"ping": "pong", "timestamp": time.time()}


@router.get("/health")
async def health_check():
    # Aquí podrías añadir lógica para verificar conexión a Supabase/LLM
    return {"status": "online", "version": "1.0.0"}
