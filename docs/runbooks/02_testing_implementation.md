# 02 - Implementación de Pruebas (Testing)

Este runbook detalla el procedimiento para implementar una suite de pruebas profesional para asegurar la calidad del código y prevenir regresiones.

## 1. Configuración del Entorno de Pruebas
1.  **Instalar dependencias:**
    ```bash
    uv add --dev pytest pytest-asyncio pytest-cov httpx
    ```
2.  **Configurar `pytest.ini`:**
    Crear el archivo en la raíz con:
    ```ini
    [pytest]
    asyncio_mode = auto
    testpaths = tests
    ```

## 2. Pruebas Unitarias
### AI Service (`app/services/ai_service.py`)
-   **Mocking:** Utilizar `unittest.mock` para simular las respuestas de la API de Gemini.
-   **Casos:** Probar generación exitosa, manejo de errores de API, y validación de prompts.

### Repository (`app/repository/sermon_repository.py`)
-   **DB Mocking/Test DB:** Usar una base de datos de prueba separada o mocks para `supabase-py`.
-   **Casos:** CRUD completo de sermones, manejo de errores de base de datos.

## 3. Pruebas de Integración
-   **Cliente de Pruebas:** Utilizar `httpx.AsyncClient` junto con `FastAPI.test_client`.
-   **Flujo:** Autenticación -> Creación de Sermón -> Consulta -> Actualización.
-   **Validación:** Verificar códigos de estado HTTP y estructura de respuesta.

## 4. Cobertura de Código
1.  **Ejecutar con cobertura:**
    ```bash
    pytest --cov=app tests/
    ```
2.  **Objetivo:** Mantener una cobertura superior al 80%.
3.  **Reporte HTML:** `pytest --cov=app --cov-report=html tests/` para inspeccionar líneas no cubiertas.

## 5. Automatización
Asegurar que las pruebas se ejecuten localmente antes de cada commit y en el pipeline de CI.
