#!/bin/bash
set -e

echo "--- DEPLOYMENT START ---"

# Migraciones en segundo plano o con timeout para no bloquear healthcheck si tardan
echo "Running Migrations..."
alembic upgrade head || echo "Migrations warning: Check DB connection."

# Puerto dinámico para Railway
PORT_TO_USE=${PORT:-8080}
echo "Launching Uvicorn on Port $PORT_TO_USE..."

# Ejecutar uvicorn
exec uvicorn main:app --host 0.0.0.0 --port "$PORT_TO_USE" --proxy-headers --log-level info
