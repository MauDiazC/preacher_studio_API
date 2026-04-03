#!/bin/bash
set -e

echo "--- STARTING DEPLOYMENT SCRIPT ---"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head || echo "Migrations skipped."

# Start the application
# Usamos directamente $PORT inyectado por Railway
echo "Starting uvicorn on port ${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers
