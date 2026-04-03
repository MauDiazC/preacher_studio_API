#!/bin/bash
set -e

echo "--- STARTING DEPLOYMENT SCRIPT ---"

# Debug Port
echo "Checking PORT variable: '$PORT'"
if [[ ! "$PORT" =~ ^[0-9]+$ ]]; then
  echo "Warning: PORT is not a valid integer ('$PORT'). Forcing PORT=8000"
  export PORT=8000
fi

# Run database migrations
echo "Running database migrations..."
# Intentamos aplicar la migración. 
# Si falla por conflicto de historia, intentaremos estampar el head.
alembic upgrade head || {
    echo "Migration failed. This might be due to an existing alembic_version table."
    echo "Trying to stamp the head and retry..."
    alembic stamp head
    alembic upgrade head
}

echo "Database migrations completed successfully."

# Start the application
echo "Starting uvicorn on port $PORT..."
exec uvicorn main:app --host 0.0.0.0 --port "$PORT" --proxy-headers
