import logging
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from rich.console import Console
from app.api.endpoints import sermons, system, websocket_endpoints, export, profile
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
        profiles_sample_rate=1.0,
    )

# Configuración de Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="Preacher Studio API",
    description="Backend profesional para la gestión de sermones con mentoría por IA.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore

console = Console()
setup_logging()
logger = logging.getLogger("fastapi")

# Middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Manejo de Excepciones de la Aplicación
@app.exception_handler(AppBaseException)
async def app_exception_handler(request: Request, exc: AppBaseException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "message": exc.message,
            "details": exc.details,
        },
    )


# Manejo Global de Excepciones (Catch-all)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"[bold red]Error Crítico:[/bold red] {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "ERR_INTERNAL_000",
            "message": "Error interno en el servidor homilético.",
        },
    )


# Inclusión de Rutas con Versionamiento v1
api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(sermons.router)
api_v1_router.include_router(system.router)
api_v1_router.include_router(export.router)
api_v1_router.include_router(profile.router)

# Las rutas de websocket suelen no llevar prefijo de api o se manejan aparte,
# pero las incluiremos para consistencia si es necesario.
app.include_router(api_v1_router)
app.include_router(websocket_endpoints.router)


# Health check en raíz (fuera de v1 para monitoreo simple)
@app.get("/health", tags=["System"])
async def root_health():
    return {"status": "online", "version": "1.0.0"}


@app.on_event("startup")
async def startup_event():
    # Inicialización de Caché
    redis_url = settings.get("REDIS_URL")
    if redis_url:
        import redis.asyncio as redis
        from fastapi_cache.backends.redis import RedisBackend

        r = redis.from_url(redis_url, encoding="utf8", decode_responses=True)
        FastAPICache.init(RedisBackend(r), prefix="fastapi-cache")
        logger.info("🚀 Caché inicializada con Redis")
    else:
        FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
        logger.info("🚀 Caché inicializada en memoria (No se detectó Redis)")

    console.print(
        "[bold green]✅ Backend 'Zen Light' v1 iniciado con éxito[/bold green]"
    )
