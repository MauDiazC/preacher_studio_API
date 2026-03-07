# 06 - Rendimiento y Escalabilidad

Procedimiento para mejorar la capacidad de respuesta y eficiencia de la aplicación bajo carga.

## 1. Capa de Caché (Redis)
1.  **Instalación:**
    ```bash
    uv add redis
    ```
2.  **Uso para Citas Bíblicas:** Cachear las respuestas de referencias bíblicas comunes para evitar llamadas repetidas a APIs externas o IA.
3.  **Configuración:** Utilizar `FastAPI-Cache` o una implementación manual con Redis en Railway para gestionar el TTL (Time To Live) de las entradas.

## 2. Resiliencia en WebSockets
- **Reconexión Exponencial:** Implementar en el cliente (frontend) una estrategia de reintento `2^n` segundos tras una desconexión accidental.
- **Buffer de Mensajes:** Si la conexión se pierde, almacenar los mensajes pendientes localmente y enviarlos una vez se restablezca.
- **Keep-Alive:** Implementar un sistema de `ping/pong` para detectar conexiones muertas antes de que el servidor las cierre.

## 3. Background Tasks
- **Descarga de Tareas:** Identificar tareas que no requieren respuesta inmediata (ej: enviar un email, guardar logs complejos de IA).
- **Implementación:** Utilizar `BackgroundTasks` de FastAPI en los endpoints correspondientes para devolver la respuesta al usuario lo antes posible.
- **Monitoreo:** Asegurar que las tareas en segundo plano se completen correctamente mediante logs específicos.

## 4. Optimización de Base de Datos
- **Índices SQL:** Crear índices en las columnas `user_id` y `created_at` de la tabla `sermons` para acelerar el filtrado y ordenamiento.
- **Pooling de Conexiones:** Ajustar los parámetros de conexión de Supabase para manejar el volumen de peticiones esperado.
