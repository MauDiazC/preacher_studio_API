# Runbook 01: Guía de Despliegue en Railway

Este documento detalla el procedimiento para desplegar el backend profesional de **Preacher Studio API** en [Railway](https://railway.app/).

## 1. Prerrequisitos

- Una cuenta activa en [Railway.app](https://railway.app/).
- El código fuente actualizado con las mejoras de rendimiento y seguridad.
- Accesos a servicios externos:
  - **Supabase:** `SUPABASE_URL` y `SUPABASE_KEY`.
  - **Google Gemini:** `GEMINI_API_KEY`.
  - **Sentry:** `SENTRY_DSN` (Opcional, para monitoreo).

## 2. Infraestructura de Soporte (Redis)

Para que el sistema de caché funcione, necesitamos una instancia de Redis corriendo en el mismo proyecto de Railway.

1. En tu proyecto de Railway, haz clic en `+ New` -> `Database` -> `Redis`.
2. Railway creará el servicio automáticamente. 
3. **Importante:** La variable de entorno `REDIS_URL` se inyectará automáticamente en el servicio de backend si ambos están en el mismo proyecto. El backend detectará esta variable en el arranque.

## 3. Estrategia de Despliegue (Dockerfile)

Usaremos el `Dockerfile` existente que ya está optimizado para `uv` y Python 3.14. Railway detectará este archivo automáticamente.

## 4. Configuración de Variables de Env (Production)

En la pestaña **Variables** del servicio de backend, configura lo siguiente:

| Variable | Descripción |
| :--- | :--- |
| `ENV_FOR_DYNACONF` | `production` |
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_KEY` | Clave API de Supabase (Service Role recomendada) |
| `GEMINI_API_KEY` | Tu API Key de Google Gemini |
| `SECRET_KEY` | Clave secreta larga para firmar JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` (o el valor deseado) |
| `SENTRY_DSN` | URL de tu proyecto en Sentry (para logs profesionales) |
| `PORT` | `8000` (Inyectada por Railway usualmente) |

## 5. Pasos Críticos para el Primer Despliegue

1. **Base de Datos:** Antes de que la API funcione, debes ejecutar los scripts SQL en el editor de Supabase:
   - `db/schemas.sql` (Esquema base).
   - `db/optimizations.sql` (Índices y tablas de historial).
   - `db/profile_mentorship.sql` (Nuevos campos de perfil).
2. **Conexión de Repo:** Conecta Railway a tu rama `main`.
3. **Verificación de Salud:** Una vez desplegado, verifica:
   - `GET /health` -> Debe responder `{"status": "online", "version": "1.0.0"}`.
   - `GET /api/v1/ping` -> Debe responder con el timestamp.

## 6. Monitoreo Post-Despliegue

- **Sentry:** Revisa que no haya errores de conexión al arrancar (especialmente con Redis o Supabase).
- **Railway Logs:** Busca el mensaje: `🚀 Caché inicializada con Redis`. Si dice `Caché inicializada en memoria`, verifica que el servicio de Redis esté activo.
- **Swagger:** Visita `/docs` para confirmar que todos los nuevos endpoints (Exportación, Perfil, etc.) son visibles.
