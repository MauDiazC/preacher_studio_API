#!/bin/bash
set -e

echo "--- DEPLOYMENT START ---"

# Migraciones
echo "Running Migrations..."
alembic upgrade head || echo "Migrations skipped."

# Uvicorn
PORT_TO_USE=${PORT:-8000}
echo "Launching Uvicorn on Port $PORT_TO_USE..."
exec uvicorn main:app --host 0.0.0.0 --port "$PORT_TO_USE" --proxy-headers --log-level info
