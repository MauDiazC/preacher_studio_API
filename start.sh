#!/bin/bash
set -e

echo "--- DEPLOYMENT START ---"

# Migraciones (Si fallan, el servidor intenta arrancar de todos modos)
echo "Running Migrations..."
alembic upgrade head || echo "Migrations warning: Check DB connection but continuing..."

# Railway usa PORT, si no existe usamos 8080
PORT_TO_USE=${PORT:-8080}
echo "Launching Uvicorn on Port $PORT_TO_USE..."

# Ejecutar uvicorn con host 0.0.0.0
exec uvicorn main:app --host 0.0.0.0 --port "$PORT_TO_USE" --proxy-headers --log-level info
