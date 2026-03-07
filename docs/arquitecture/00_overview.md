# 00 - Visión General - Preacher Studio API

Este documento proporciona una visión general de la tecnología y el propósito del proyecto **Preacher Studio API**.

## Propósito del Proyecto
Preacher Studio es una plataforma de mentoría homilética diseñada para ayudar a pastores y predicadores a estructurar sus sermones con asistencia de Inteligencia Artificial. El backend proporciona una API robusta para la gestión de sermones, persistencia en tiempo real e integración con modelos de lenguaje.

## Stack Tecnológico Principal

- **Framework Web:** [FastAPI](https://fastapi.tiangolo.com/) - Elegido por su alto rendimiento, soporte nativo para `asyncio`, versionamiento de API y generación automática de documentación OpenAPI profesional.
- **Base de Datos y Autenticación:** [Supabase](https://supabase.com/) - Utilizado como Backend-as-a-Service (BaaS) para PostgreSQL, gestión de usuarios (GoTrue) y capacidades de base de datos en tiempo real.
- **Inteligencia Artificial:** [Google Gemini 1.5 Flash](https://ai.google.dev/) - Motor de IA optimizado para baja latencia, utilizado para generar sugerencias homiléticas personalizadas por estilo de mentoría.
- **Caché y Rendimiento:** [Redis](https://redis.io/) y [FastAPI-Cache2](https://github.com/long2ice/fastapi-cache) - Implementado para reducir latencia en consultas repetitivas y mejorar la escalabilidad.
- **Observabilidad:** [Sentry](https://sentry.io/) - Monitoreo de errores en tiempo real y trazas de rendimiento.
- **Seguridad:** [Slowapi](https://github.com/lauryndas/slowapi) - Rate limiting por usuario para protección contra abusos y control de costos de IA.
- **Gestión de Dependencias:** [uv](https://github.com/astral-sh/uv) - Herramienta de gestión de paquetes y entornos virtuales de Python extremadamente rápida.
- **Calidad de Código:** [Pytest](https://pytest.org/), [Ruff](https://github.com/astral-sh/ruff) y [Mypy](https://mypy-lang.org/) - Suite completa de pruebas automatizadas (>95% cobertura), linting y tipado estricto.
- **Configuración:** [Dynaconf](https://www.dynaconf.com/) - Gestión de configuraciones multi-entorno y manejo seguro de secretos.
