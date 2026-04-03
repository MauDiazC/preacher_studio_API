#!/bin/bash
set -e

echo "--- STARTING DEPLOYMENT SCRIPT ---"

# Debug Port
echo "Checking PORT variable: '$PORT'"
if [[ ! "$PORT" =~ ^[0-9]+$ ]]; then
  echo "Warning: PORT is not a valid integer ('$PORT'). Forcing PORT=8080"
  export PORT=8080
fi

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

echo "Database migrations completed successfully."

# Start the application
echo "Starting uvicorn on port $PORT..."
exec uvicorn main:app --host 0.0.0.0 --port "$PORT" --proxy-headers
