import logging
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from rich.console import Console
from app.api.endpoints import sermons, system, websocket_endpoints, export, profile, auth
from app.core.logger import setup_logging
from app.core.exceptions import AppBaseException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config.config import settings
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

# Configuración de Sentry
if settings.get("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
        traces_sample_rate=1.0,
    )

# Configuración de FastAPI
app = FastAPI(
    title="Preacher Studio API",
    version="1.0.2",
    redirect_slashes=False,
)

# CORS TOTALMENTE ABIERTO (Para debuguear el 502)
# Una vez que funcione el registro, lo volveremos a cerrar.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    print("✅ Backend iniciado correctamente en modo estable")
