import logging
from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import sermons, system, websocket_endpoints, export, profile, auth
from app.core.exceptions import AppBaseException
from config.config import settings
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

print("--- BACKEND BOOTING UP ---")

app = FastAPI(
    title="Preacher Studio API",
    version="1.0.3",
    redirect_slashes=False,
)

# CORS TOTALMENTE ABIERTO (Sin credentials para permitir "*")
# Esto es solo para diagnosticar el 502
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def simple_log(request: Request, call_next):
    if request.url.path == "/health":
        return await call_next(request)
    print(f"DEBUG: >>> PETICION: {request.method} {request.url}")
    response = await call_next(request)
    print(f"DEBUG: <<< RESPUESTA: {response.status_code}")
    return response

# Rutas
api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth.router)
api_v1_router.include_router(sermons.router)
api_v1_router.include_router(system.router)
api_v1_router.include_router(export.router)
api_v1_router.include_router(profile.router)

app.include_router(api_v1_router)
app.include_router(websocket_endpoints.router)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.3"}

@app.on_event("startup")
async def startup_event():
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    print("🚀 SERVIDOR LISTO PARA RECIBIR DATOS")
