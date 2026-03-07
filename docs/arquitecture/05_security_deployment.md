# 05 - Seguridad y Despliegue - Preacher Studio API

Detalles sobre la protección de la API y las estrategias de infraestructura profesional.

## 1. Seguridad y Autenticación

- **Supabase Auth (GoTrue):** Delegación completa de identidad y gestión de tokens JWT.
- **Rate Limiting:** Implementado mediante `Slowapi` para proteger endpoints críticos (especialmente IA) contra ataques DoS y controlar costos.
- **Sanitización de Datos:** Todos los esquemas de Pydantic incluyen validadores que limpian etiquetas HTML peligrosas de las entradas de texto para prevenir XSS.
- **Aislamiento por `user_id`:** Implementado en la capa de `Repository`, garantizando que ninguna consulta SQL pueda acceder a datos de otro usuario.

## 2. CI/CD (Integración y Despliegue Continuo)

- **GitHub Actions:** Pipeline automatizado que se ejecuta en cada Push a `main` o `develop`.
- **Flujo de Calidad:** 
  1. **Linting:** Ruff check para asegurar estándares de estilo.
  2. **Formateo:** Ruff format para consistencia de código.
  3. **Tipado:** Mypy con tipado estricto.
  4. **Pruebas:** Pytest con generación de reportes de cobertura (>95%).
- **Railway Autodeploy:** Despliegue automático a producción tras pasar exitosamente todas las validaciones de CI.

## 3. Infraestructura y Monitoreo Profesional

- **Observabilidad:** Integración profunda con **Sentry** para captura de errores en producción y monitoreo de trazas de rendimiento.
- **Logging Estructurado:** Logs en formato **JSON** con rotación diaria automática, preparados para ser ingeridos por agregadores de logs (Datadog, ELK).
- **Capa de Caché:** Integración con **Redis** para mejorar tiempos de respuesta y reducir latencia en la capa de transporte.

## 4. Gestión de Configuración (Dynaconf)

- **Configuración Segura:** Uso de `settings.toml` para bases y variables de entorno `DYNACONF_*` para secretos en producción.
- **Zero Secrets in Git:** Garantía total de que ninguna llave de API o secreto está presente en el repositorio.

