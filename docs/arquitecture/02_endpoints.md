# 02 - Análisis de Endpoints - Preacher Studio API

Este documento detalla los endpoints de la API v1, sus funcionalidades, parámetros y flujos de trabajo asociados. Todos los endpoints de negocio requieren autenticación Bearer JWT.

## 1. Endpoints de Sermones (`/api/v1/sermons`)

### 1.1 Listar Sermones
- **Método:** `GET /api/v1/sermons/`
- **Funcionalidad:** Recupera sermones con filtrado avanzado.
- **Parámetros:** 
  - `limit`, `offset` (Paginación)
  - `search` (Búsqueda por texto en título/contenido)
  - `status` (Filtrar por seed, draft, final)
  - `from_date`, `to_date` (Rango cronológico)

### 1.2 Crear Sermón
- **Método:** `POST /api/v1/sermons/`
- **Funcionalidad:** Crea un sermón inicial.
- **Esquema:** `SermonCreate` -> `SermonRead` (Status 201).

### 1.3 Auto-guardado
- **Método:** `PATCH /api/v1/sermons/{sermon_id}`
- **Funcionalidad:** Actualización parcial no bloqueante.

### 1.4 Asistencia por IA
- **Método:** `POST /api/v1/sermons/{sermon_id}/ai-assist`
- **Funcionalidad:** Generación de sugerencias personalizadas según el estilo del pastor.
- **Rate Limit:** 5 peticiones por minuto por IP/Usuario.

### 1.5 Snapshots (Historial)
- **Método:** `POST /api/v1/sermons/{sermon_id}/snapshot`
- **Funcionalidad:** Crea un punto de restauración en segundo plano (`BackgroundTasks`).

---

## 2. Exportación (`/api/v1/export`)

### 2.1 Exportar a PDF
- **Método:** `GET /api/v1/export/{sermon_id}/pdf`
- **Respuesta:** Archivo binario `application/pdf`.

### 2.2 Exportar a Word
- **Método:** `GET /api/v1/export/{sermon_id}/word`
- **Respuesta:** Archivo binario `.docx`.

---

## 3. Gestión de Perfil (`/api/v1/profile`)

### 3.1 Obtener Perfil
- **Método:** `GET /api/v1/profile/`
- **Funcionalidad:** Retorna datos del pastor y su `mentorship_style`.

### 3.2 Actualizar Perfil
- **Método:** `PUT /api/v1/profile/`
- **Funcionalidad:** Actualiza preferencias de mentoría.

---

## 4. Comunicación en Tiempo Real (WebSockets)

### 4.1 Conexión de Edición
- **URL:** `ws:///ws/sermons/{sermon_id}?token={JWT}`
- **Heartbeat:** El servidor envía un `{"type": "ping"}` cada 30 segundos; el cliente debe responder para mantener la sesión activa.

---

## 5. Endpoints del Sistema

### 5.1 Root Health
- **Método:** `GET /health` (Fuera de v1 para monitoreo de infraestructura).

### 5.2 API Ping
- **Método:** `GET /api/v1/ping`
