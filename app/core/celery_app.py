from celery import Celery
from config.config import settings
import os

# Configuración de Redis
# Si no está en settings, usamos localhost como fallback para desarrollo local
redis_url = settings.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "preacher_studio",
    broker=redis_url,
    backend=redis_url,
    include=["app.worker.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300, # 5 minutos máximo por tarea
)

if __name__ == "__main__":
    celery_app.start()
