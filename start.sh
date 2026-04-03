#!/bin/bash
set -e

echo "--- STARTING DEPLOYMENT SCRIPT ---"

# Debug Port
echo "Railway PORT: $PORT"
ACTUAL_PORT=${PORT:-8080}

# Run database migrations
echo "Running database migrations..."
# Si esto falla, el script se detiene (set -e) y Railway nos avisa
alembic upgrade head

echo "Database migrations handled."

# Start the application
echo "Starting uvicorn on port $ACTUAL_PORT..."
exec uvicorn main:app --host 0.0.0.0 --port "$ACTUAL_PORT" --proxy-headers
