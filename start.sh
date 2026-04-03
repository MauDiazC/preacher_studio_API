#!/bin/bash
set -e

echo "--- STARTING DEPLOYMENT SCRIPT ---"

# Debug Port
echo "Railway PORT: $PORT"
ACTUAL_PORT=${PORT:-8080}

# Run database migrations
echo "Running database migrations..."
# Usamos || true para que si las tablas ya existen no truene el inicio
alembic upgrade head || echo "Migrations skipped or already applied."

echo "Database migrations handled."

# Start the application
echo "Starting uvicorn on port $ACTUAL_PORT..."
exec uvicorn main:app --host 0.0.0.0 --port "$ACTUAL_PORT" --proxy-headers
