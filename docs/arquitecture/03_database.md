# 03 - Modelo de Datos - Preacher Studio API

El sistema utiliza **PostgreSQL** a través de **Supabase** como motor de base de datos principal, aprovechando sus capacidades de Row Level Security (RLS) y Auth integrado.

## Tablas del Sistema

### 1. `profiles`
Extensión de la tabla de usuarios de Supabase.
- `id` (UUID, PK): Referencia a `auth.users`.
- `full_name` (Text): Nombre completo del pastor.
- `mentorship_style` (Text): Preferencia de IA (`encouraging`, `academic`, `practical`).
- `updated_at` (Timestamp): Fecha de última modificación.

### 2. `sermons`
Tabla central donde ocurre la edición activa.
- `id` (UUID, PK): Identificador único del sermón.
- `user_id` (UUID, FK): Referencia al perfil del pastor.
- `title` (Text): Título del sermón.
- `main_passage` (Text): Pasaje bíblico base.
- `content` (Text): Contenido Markdown o texto plano del sermón.
- `status` (Text): Estado actual (`seed`, `draft`, `final`).
- `created_at` / `updated_at`: Timestamps de auditoría.

### 3. `sermon_history`
Almacena snapshots históricos de los sermones creados vía `BackgroundTasks`.
- `id` (UUID, PK): Identificador del registro.
- `sermon_id` (UUID, FK): Referencia al sermón original.
- `content_snapshot` (Text): El contenido completo en el momento del snapshot.
- `version_label` (Text): Etiqueta descriptiva.

### 4. `llm_logs`
Auditoría de las interacciones con la Inteligencia Artificial para monitoreo de calidad.

## Optimizaciones de Rendimiento

- **Índices de Búsqueda:** Se han implementado índices en `user_id` y `created_at` para acelerar el filtrado y ordenamiento en el listado de sermones.
- **Capa de Caché (Redis):** Los resultados de consultas frecuentes y respuestas de IA se cachean con TTL dinámico para reducir la carga en Supabase y Gemini.
- **Aislamiento de Datos (RLS):** Todas las tablas tienen habilitado Row Level Security para garantizar que un pastor solo acceda a sus propios datos a nivel de motor de base de datos.
