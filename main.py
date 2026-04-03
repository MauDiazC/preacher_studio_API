import logging
from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import sermons, system, websocket_endpoints, export, profile, auth
from app.core.exceptions import AppBaseException
from config.config import settings
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

# Configuración de FastAPI
app = FastAPI(
    title="Preacher Studio API",
    version="1.0.2",
    redirect_slashes=False,
)

# CORS CORREGIDO (No se puede usar "*" con credentials=True)
allowed_origins = [
    "https://preacher-studio-front-production.up.railway.app",
    "https://preacherstudioapi-production.up.railway.app",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de loggeo por PRINT (aparece sí o sí en Railway)
@app.middleware("http")
async def simple_log(request: Request, call_next):
    print(f"DEBUG: >>> Recibida petición {request.method} en {request.url}")
    response = await call_next(request)
    print(f"DEBUG: <<< Respuesta enviada con status {response.status_code}")
    return response

# Manejo de Excepciones
@app.exception_handler(AppBaseException)
async def app_exception_handler(request: Request, exc: AppBaseException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message, "details": exc.details},
    )

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
    return {"status": "ok", "version": "1.0.2"}

@app.on_event("startup")
async def startup_event():
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    print("🚀 API LISTA Y ESCUCHANDO")
