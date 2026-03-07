# ADR 01: Selección del Stack Tecnológico - Preacher Studio

Este documento detalla las justificaciones técnicas para la elección de las tecnologías principales y por qué se prefirieron sobre otras alternativas populares.

## 1. Framework: FastAPI (vs Django o Flask)

**Decisión:** Se utiliza **FastAPI** como el core del backend.

**Razón de la elección:**
- **Rendimiento Asíncrono:** La naturaleza de la aplicación (WebSockets para guardado en tiempo real y llamadas de larga duración a APIs de IA) requiere un manejo eficiente de la concurrencia que FastAPI proporciona de forma nativa.
- **Validación con Pydantic:** La generación automática de esquemas y documentación OpenAPI (Swagger) reduce drásticamente el tiempo de desarrollo y los errores de integración con el frontend.
- **Tipado Estático:** Facilita la mantenibilidad a largo plazo en comparación con Flask.

**Alternativas rechazadas:**
- *Django:* Demasiado pesado ("heavyweight") para una API que no requiere el sistema de plantillas o el ORM tradicional de Django. El overhead de aprendizaje y configuración es mayor.
- *Flask:* Aunque es ligero, carece de soporte asíncrono robusto "out-of-the-box" y requiere múltiples extensiones de terceros para validación y documentación.

## 2. Base de Datos y Auth: Supabase (vs Firebase o PostgreSQL puro)

**Decisión:** Se utiliza **Supabase** como plataforma de infraestructura.

**Razón de la elección:**
- **PostgreSQL Real:** A diferencia de NoSQL, PostgreSQL permite relaciones complejas necesarias para el historial de sermones y logs de IA con integridad referencial.
- **GoTrue (Auth):** Proporciona un sistema de autenticación listo para usar que se integra directamente con las políticas de seguridad de la base de datos (RLS).
- **Capacidades Realtime:** Facilita la sincronización de estados que el editor de sermones requiere.

**Alternativas rechazadas:**
- *Firebase:* El modelo NoSQL (Firestore) dificulta la realización de consultas relacionales complejas y reportes estructurados.
- *Auto-hospedado (Postgres + Auth):* Requeriría configurar y mantener servidores de base de datos, sistemas de migración y servicios de autenticación manuales, aumentando la complejidad operativa.

## 3. IA: Google Gemini 1.5 Flash (vs OpenAI GPT-4o)

**Decisión:** Se utiliza **Gemini 1.5 Flash**.

**Razón de la elección:**
- **Ventana de Contexto:** Gemini ofrece una de las ventanas de contexto más grandes del mercado, ideal para analizar sermones largos o bibliotecas completas de notas en el futuro.
- **Costo y Velocidad:** El modelo "Flash" está optimizado para latencias bajas y costos reducidos, crucial para una herramienta de edición interactiva.
- **Integración con Google Cloud:** Facilita la expansión futura si se requieren otros servicios de ML.

**Alternativas rechazadas:**
- *OpenAI GPT-4o:* Aunque es excelente, los costos por token pueden ser superiores para casos de uso de alta frecuencia (como sugerencias mientras se escribe).

## 4. Gestión de Dependencias: uv (vs Poetry o pip)

**Decisión:** Se utiliza **uv**.

**Razón de la elección:**
- **Velocidad Extrema:** Instalación de dependencias y resolución de grafos en milisegundos.
- **Simplificación:** Reemplaza múltiples herramientas (pip, venv, pip-tools) en un solo binario de alto rendimiento escrito en Rust.

**Alternativas rechazadas:**
- *Poetry:* Aunque es bueno para el bloqueo de versiones, su rendimiento en la resolución de dependencias es notablemente más lento que `uv`.

## 5. Configuración: Dynaconf (vs python-dotenv)

**Decisión:** Se utiliza **Dynaconf**.

**Razón de la elección:**
- **Gestión Multi-entorno:** Permite tener configuraciones separadas para `development`, `testing` y `production` de forma jerárquica y limpia.
- **Seguridad:** Facilita la inyección de secretos desde el entorno sin necesidad de archivos `.env` dispersos.

**Alternativas rechazadas:**
- *python-dotenv:* Demasiado básico. No permite herencia de configuraciones ni validación tipada de forma nativa.
