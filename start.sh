#!/bin/bash
set -e

# Asegurar que estamos en el directorio correcto
cd /app

# Ejecutar migraciones (silenciosas si no hay cambios)
echo "--- Running Migrations ---"
alembic upgrade head || echo "Migrations failed or not needed."

# Iniciar aplicación en puerto 8080 (que es el que Railway asignó en tus logs)
# Usamos --timeout-keep-alive para evitar el 502 por desconexión prematura
echo "--- Starting Server ---"
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --proxy-headers --timeout-keep-alive 60
