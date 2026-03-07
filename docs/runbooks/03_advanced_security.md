# 03 - Seguridad Avanzada

Procedimiento para robustecer la seguridad de la aplicación a nivel de datos, API y acceso.

## 1. Sanitización de Entrada con Pydantic
- **Validación Estricta:** Añadir `min_length`, `max_length`, `regex` y validadores personalizados (`@field_validator`) en `app/schemas/sermon.py` para prevenir inyecciones.
- **Limpieza de Datos:** Asegurar que los campos de texto no contengan scripts maliciosos.

## 2. Rate Limiting con Slowapi
1.  **Instalación:**
    ```bash
    uv add slowapi
    ```
2.  **Configuración:** Inicializar el limitador en `main.py` utilizando una clave única por usuario (ej: `user_id` del token JWT).
3.  **Aplicación:** Aplicar decoradores `@limiter.limit("10/minute")` específicamente en los endpoints que consumen IA para proteger el presupuesto y evitar ataques DoS.

## 3. Auditoría de Row Level Security (RLS) en Supabase
- **Políticas de Aislamiento:** Verificar que todas las tablas tengan habilitado RLS.
- **Filtros de `user_id`:** Asegurar que las consultas siempre incluyan el filtro por `user_id` autenticado y que las políticas SQL en Supabase (`auth.uid() = user_id`) sean correctas.
- **Acceso Directo:** Probar que el acceso directo a la base de datos a través de la API REST de Supabase no permita leer datos de otros usuarios sin el token correcto.

## 4. Gestión de Secretos
- **Revisión de `.env`:** Asegurar que ninguna clave API (Gemini, Supabase Key) esté hardcodeada.
- **Railway Secrets:** Verificar que todas las variables de entorno estén configuradas en el panel de Railway y no en el repositorio Git.
