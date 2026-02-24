import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from rich.console import Console
from app.api.endpoints import sermons, system, websocket_endpoints
from app.core.logger import setup_logging

console = Console()
setup_logging()
logger = logging.getLogger("fastapi")

app = FastAPI(title="Preacher Studio API")

# Middleware de CORS para Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción usa tu URL de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejo Global de Excepciones
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"[bold red]Error Crítico:[/bold red] {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Error interno en el servidor homilético."},
    )

# Inclusión de Rutas
app.include_router(system.router)
app.include_router(sermons.router)
app.include_router(websocket_endpoints.router)

@app.on_event("startup")
async def startup_event():
    console.print("[bold green]✅ Backend 'Zen Light' iniciado con éxito[/bold green]")