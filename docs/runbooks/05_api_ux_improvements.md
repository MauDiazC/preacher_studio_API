# 05 - Mejoras en la API y UX del Desarrollador

Procedimiento para enriquecer la documentación y usabilidad de la API de cara a futuros desarrolladores y consumo desde el frontend.

## 1. Documentación OpenAPI (Swagger)
- **Ejemplos en Pydantic:** Añadir el campo `examples` a los modelos en `app/schemas/sermon.py` para que el Swagger sea interactivo con datos reales.
- **Descripciones:** Utilizar `Field(..., description="...")` para cada atributo de los modelos.
- **Tags de Endpoints:** Agrupar los endpoints por categorías (Sermones, Sistema, Usuario) para mejorar la navegación en `/docs`.

## 2. Manejo de Excepciones Granular
- **Excepciones Personalizadas:** Crear una clase base de excepciones en `app/core/exceptions.py`.
- **Códigos de Error:** Implementar excepciones específicas (ej: `AIServiceException`, `EntityNotFound`) con códigos de error propios (ej: `ERR_001`, `ERR_002`).
- **Middleware/Handler:** Implementar `exception_handlers` globales en FastAPI para devolver respuestas uniformes en caso de error.

## 3. Versionamiento de API
1.  **Prefijo Global:** Mover todas las rutas actuales bajo el prefijo `/api/v1`.
2.  **Inclusión en App:** Actualizar `main.py` para incluir los routers con el nuevo prefijo.
3.  **Frontend:** Actualizar las llamadas en el frontend para apuntar a la nueva URL base `/api/v1/sermons`.

## 4. Tipado Estricto
- **Type Hints:** Asegurar que todas las funciones tengan `type hints` para parámetros y valores de retorno.
- **Validación con Mypy:** Ejecutar `mypy .` para detectar errores de tipo antes de desplegar.
