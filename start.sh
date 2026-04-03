#!/bin/bash
set -e

# Imprimir variables para depuración (sin mostrar secretos)
echo "Checking environment..."
echo "Raw PORT value: '$PORT'"

# Limpiar el valor de PORT: Si no es un número, usar 8000
if [[ ! "$PORT" =~ ^[0-9]+$ ]]; then
  echo "Warning: PORT is not a valid integer ('$PORT'). Forcing PORT=8000"
  export PORT=8000
fi

# Ejecutar migraciones de la base de datos
echo "Running database migrations..."
alembic upgrade head

# Iniciar la aplicación
echo "Starting application on port $PORT..."
exec uvicorn main:app --host 0.0.0.0 --port "$PORT" --proxy-headers
