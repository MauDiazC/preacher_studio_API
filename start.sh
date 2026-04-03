#!/bin/bash
set -e

echo "--- DEPLOYMENT START ---"

# Migraciones
echo "Running Migrations..."
alembic upgrade head || echo "Migration error, but continuing..."

# Uvicorn
echo "Launching Uvicorn on Port $PORT..."
# Añadimos --log-level debug para ver TODO
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --proxy-headers --log-level debug --timeout-keep-alive 75
