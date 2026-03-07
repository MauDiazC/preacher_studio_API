# 04 - Observabilidad y Monitoreo

Procedimiento para implementar una estrategia de monitoreo real y captura de errores en producción.

## 1. Integración con Sentry
1.  **Instalación:**
    ```bash
    uv add sentry-sdk
    ```
2.  **Configuración en `main.py`:**
    ```python
    import sentry_sdk
    sentry_sdk.init(dsn="SENTRY_DSN", traces_sample_rate=1.0)
    ```
3.  **Captura:** Verificar que las excepciones no manejadas lleguen al dashboard de Sentry.

## 2. Métricas de IA y Latencia
- **Instrumentación:** Medir el tiempo de respuesta de `ai_service.py` usando `time.perf_counter()`.
- **Registro de Métricas:** Guardar en logs estructurados o en una tabla dedicada (`ai_metrics`) el tiempo de ejecución y si fue exitoso o falló.
- **Alertas:** Configurar alertas si la tasa de fallos de Gemini supera el 5%.

## 3. Logging Estructurado
- **Formato JSON:** Configurar el logger en `app/core/logger.py` para emitir logs en formato JSON, facilitando su análisis.
- **Rotación de Archivos:** Configurar `TimedRotatingFileHandler` para evitar que los logs llenen el disco del servidor.
- **Nivel de Log:** Asegurar que el nivel esté en `INFO` en producción y `DEBUG` en desarrollo.

## 4. Dashboards de Railway/Supabase
- **Railway:** Monitorear el uso de CPU y Memoria del contenedor.
- **Supabase:** Revisar el volumen de peticiones y latencia de base de datos desde el panel oficial.
