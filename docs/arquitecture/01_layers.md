# 01 - Estructura de Capas - Preacher Studio API

El proyecto sigue un patrón de diseño por capas que facilita la mantenibilidad y escalabilidad del sistema.

## Capas del Sistema

```text
├── main.py                # Punto de entrada (Configura FastAPI, Sentry, Rate Limit, Caché)
├── app/
│   ├── api/               # CAPA DE TRANSPORTE (Controladores/Rutas)
│   │   └── endpoints/     # Definición de endpoints REST v1, WebSockets y Exportación
│   ├── services/          # CAPA DE NEGOCIO (Lógica compleja)
│   │   └── ai_service.py  # Gestión de IA (Gemini) con estilos de mentoría
│   ├── repository/        # CAPA DE DATOS (Abstracción de Persistencia)
│   │   └── sermon_repository.py # Acceso a Supabase con filtrado avanzado
│   ├── schemas/           # MODELOS DE DATOS (Pydantic para validación y OpenAPI)
│   │   └── sermon.py      # Definición enriquecida de esquemas
│   └── core/              # UTILIDADES CORE (Utilidades globales)
│       ├── security.py    # Autenticación JWT robusta
│       ├── db.py          # Cliente de base de datos singleton
│       ├── logger.py      # Configuración de registro estructurado JSON
│       └── exceptions.py  # Sistema de excepciones granulares
├── cli/                   # HERRAMIENTAS DE LÍNEA DE COMANDOS (Release Notes)
├── config/                # GESTIÓN DE CONFIGURACIÓN DINÁMICA (Dynaconf)
└── db/                    # ESQUEMAS SQL Y OPTIMIZACIONES
```

### Detalle de Capas

- **Transporte (API):** Encargada de recibir solicitudes HTTP y conexiones WebSocket. Soporta versionamiento (`/api/v1`), utiliza `BackgroundTasks` para operaciones asíncronas no bloqueantes y aplica rate limiting por endpoint.
- **Negocio (Services):** Lógica homilética pura. Centraliza la comunicación con Google Gemini, permitiendo personalización mediante perfiles de pastor y estilos de mentoría.
- **Persistencia (Repository):** Implementa el patrón **Repository**. Maneja el aislamiento de datos por `user_id`, implementa búsqueda de texto completo y filtrado temporal complejo.
- **Validación (Schemas):** Modelos Pydantic v2 con validadores personalizados para sanitización de HTML y enriquecimiento de documentación OpenAPI (ejemplos y descripciones).
- **Core:** Centraliza la seguridad (Argon2 para hashes, PyJWT para tokens), el manejo de errores global y el logging estructurado con rotación automática.
