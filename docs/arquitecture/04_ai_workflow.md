# 04 - Flujo de Trabajo Homilético (IA) - Preacher Studio API

El sistema integra **Google Gemini 1.5 Flash** para proporcionar asistencia avanzada en la creación de sermones.

## 1. El Mentor Homilético Personalizado

La IA se configura con una instrucción de sistema base, pero su comportamiento varía según el perfil del pastor:
- **Estilo Alentador (Encouraging):** Tono pastoral, lleno de esperanza y consuelo.
- **Estilo Académico (Academic):** Análisis exegético profundo, histórico y teológico.
- **Estilo Práctico (Practical):** Enfocado en aplicaciones para la vida diaria y desafíos actuales.

## 2. Proceso de Generación

1. **Captura de Contexto:** Extrae título, notas y la preferencia de estilo desde el perfil del usuario.
2. **Construcción del Prompt Dinámico:** Se inyecta la instrucción de estilo específica en el prompt enviado a Gemini.
3. **Inferencia con Gemini:** Utiliza `gemini-1.5-flash` con temperatura `0.7`.
4. **Métricas de Latencia:** Se mide el tiempo de respuesta preciso y se registra para monitoreo de rendimiento.
5. **Validación:** Validación estricta del JSON mediante Pydantic.

## 3. Esquema de Sugerencia (JSON)

La respuesta de la IA incluye:
- `suggested_outline`: Puntos principales sugeridos.
- `verses_found`: Versículos bíblicos clave.
- `central_theme`: Tesis homilética del sermón.

## 4. Monitoreo y Observabilidad

Cada interacción genera un log estructurado que incluye:
- `latency`: Tiempo de respuesta en segundos.
- `status`: Éxito o tipo de error.
- `style`: El estilo de mentoría utilizado.
- Persistencia automática en el historial del sermón vía `BackgroundTasks`.
