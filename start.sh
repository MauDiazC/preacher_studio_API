#!/bin/bash
set -e

echo "--- DEPLOYMENT START ---"

# Migraciones
echo "Running Migrations..."
alembic upgrade head || echo "Migrations warning: Check DB connection but continuing..."

# Iniciar Celery Worker en segundo plano
echo "Starting Celery Worker..."
celery -A app.core.celery_app worker --loglevel=info --beat &

# Railway usa PORT, si no existe usamos 8080
PORT_TO_USE=${PORT:-8080}
echo "Launching Uvicorn on Port $PORT_TO_USE..."

# Ejecutar uvicorn
exec uvicorn main:app --host 0.0.0.0 --port "$PORT_TO_USE" --proxy-headers --log-level info
