# Preacher Studio API (Sermon Management)

Plataforma especializada de mentoría homilética diseñada para ayudar a guías espirituales a profundizar en el estudio de la Palabra con asistencia digital avanzada de nivel académico.

## Visión y Lenguaje del Proyecto

- **Tono Ministerial:** Se utiliza: *Asistencia Homilética Digital*, *Mentoría Teológica*, *Estudio del Texto Original*. Se prefiere "Guía Espiritual" sobre "Pastor".
- **Calibre Académico:** El análisis incluye información de léxicos profesionales (Strong, Thayer, BDB) y fuentes académicas clásicas.

## Estado Actual (v1.4 - Academic Refinement ✅)

El sistema ha sido blindado visualmente y se ha optimizado la experiencia de usuario en todo el flujo ministerial.

- **Identidad Visual "Sacred Observatory":** 
    - Implementación total en Landing, Pricing, Login, Registro, Lista de Estudios, Editor y Settings.
    - Header responsivo y blindado en el Editor para evitar solapamientos.
    - Avatar de iniciales dinámico en Settings.
- **Funcionalidades de Estudio:**
    - **Editor Integrado:** Dashboard con recursos (Bible Hub Atlas, Léxicos BLB) y editor de notas sincronizado.
    - **Estructura Académica:** Análisis dividido en 7 secciones (RVR1960, NTV, Tipo Literario, Autoría, Propósito, Historia, Significancia, Idiomas y Fuentes).
    - **Auto-guardado:** El sistema guarda automáticamente el análisis tras ser generado por la IA.
    - **Mapas Inteligentes:** Links a Bible Hub Atlas con traducción forzada a inglés para asegurar precisión.
- **Planes y Suscripciones:**
    - **Sembrador (Free):** 3 Estudios básicos/mes (Sin léxicos).
    - **Mentor (Pro):** 30 Estudios/mes + Recursos avanzados (9.99 USD / 180 MXN).
    - **Ministerio (Teams):** Estudios Ilimitados + PPTX/Keynote + Soporte (19.99 USD / 360 MXN).
- **Infraestructura:**
    - Migraciones de Alembic implementadas para el campo `additional_notes`.
    - Sincronización automática en `github` (Railway) y `origin` (Codeberg).

## Próximos Pasos (Mañana - Backend Day)
- [ ] **Backend (Stripe):** Implementar el endpoint de Webhook para procesar eventos `checkout.session.completed`.
- [ ] **Lógica de Créditos:** Finalizar la función en el backend para actualizar automáticamente los créditos en la tabla `profiles` tras una compra exitosa.
- [ ] **Refinamiento PPTX:** Adaptar la exportación a diapositivas al nuevo sistema de diseño "Sacred" con plantillas profesionales.
- [ ] **Google OAuth:** Implementar la lógica real de registro e inicio de sesión con Google.

## Punto de Restauración (v1.4 - 09/04/2026)
- **Estado:** UI blindada, navegación completa, lógica de idiomas unificada, listo para lógica de negocio de pagos.
- **Commit de Referencia:** `92bd3475` (Fix build error y refinamiento final de planes).

## Infraestructura y CI/CD
- **Hosting:** Railway (Backend) y Supabase (DB/Auth).
- **Remotos:** Sincronización automática obligatoria en `github` y `origin`.
