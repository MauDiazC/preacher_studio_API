import logging
from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import sermons, system, websocket_endpoints, export, profile, auth
from app.core.exceptions import AppBaseException
from config.config import settings
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

app = FastAPI(
    title="Preacher Studio API",
    version="1.0.3",
    redirect_slashes=False,
)

# 1. Endpoint de Salud (Primero para Railway)
@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.3"}

# 2. Middlewares
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
    
    # Log simplificado para evitar latencia
    method = request.method
    path = request.url.path
    print(f"REQ: {method} {path}")
    
    response = await call_next(request)
    return response

# 3. Rutas
api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth.router)
api_v1_router.include_router(sermons.router)
api_v1_router.include_router(system.router)
api_v1_router.include_router(export.router)
api_v1_router.include_router(profile.router)

app.include_router(api_v1_router)
app.include_router(websocket_endpoints.router)

# 4. Excepciones Globales
@app.exception_handler(AppBaseException)
async def app_exception_handler(request: Request, exc: AppBaseException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message, "error_code": exc.error_code},
    )

@app.on_event("startup")
async def startup_event():
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    print("🚀 SERVIDOR LISTO")
