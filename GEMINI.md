# Preacher Studio API (Sermon Management)

Plataforma especializada de mentoría homilética diseñada para ayudar a pastores y predicadores a profundizar en el estudio de la Palabra con asistencia digital avanzada de nivel académico.

## Visión y Lenguaje del Proyecto

- **Tono Ministerial:** Se evita estrictamente el término "IA". Se utiliza: *Asistencia Homilética Digital*, *Mentoría Teológica*, *Estudio del Texto Original*.
- **Calibre Académico:** El análisis debe incluir información de léxicos profesionales (Strong, Thayer, BDB) para justificar el valor de la suscripción.

## Estado Actual (Professionalized ✅)

El sistema ha alcanzado un nivel de madurez profesional tras completar la hoja de ruta de profesionalización al 100%.

- **Arquitectura Backend:** FastAPI bajo el prefijo `/api/v1/` con inyección de dependencias robusta.
- **Calidad y Testing:** Cobertura del 100% en lógica de negocio crítica y 99% global utilizando `pytest` y mocks profesionales para servicios externos.
- **Seguridad Avanzada:** 
    - Rate Limiting configurado con `slowapi` para endpoints de IA.
    - Sanitización de HTML y validación rigurosa con Pydantic.
    - Bypass de administrador para `mdiazcabr@gmail.com`.
- **Análisis Exegético:** 
    - Comparativa RVR1960/NVI.
    - Desglose de idiomas originales (Griego/Hebreo) con Números de Strong.
    - Atribución de fuentes académicas (Barclay, Henry, Kittel, etc.).
- **Observabilidad:** 
    - Integración con **Sentry** para errores y performance.
    - Logging estructurado en JSON con rotación diaria en `logs/`.
- **Rendimiento:** 
    - Capa de caché con **Redis** (fallback a memoria).
    - WebSockets resilientes con sistema de **Heartbeat** (ping/pong).
    - Background Tasks para operaciones pesadas (snapshots, logs de IA).
- **Frontend:** 
    - Layout ultra-rígido para evitar solapamientos.
    - Carga robusta de estudios mediante intervalos de verificación del DOM.
    - Panel de "Recursos Originales" dinámico con mapeo de libros hacia Bible Hub.
- **Exportación:** Soporte para PDF, Word y PPTX (con diseño de marca).

## Membresías (Planes)

1.  **Sembrador (Gratis):** 3 Estudios/mes. Análisis literario básico. (Default)
2.  **Mentor ($9.99/mes):** 25 Estudios/mes. Contexto histórico completo y exportación PDF/Word.
3.  **Exégeta ($19.99/mes):** Estudios ILIMITADOS. Léxico profesional, exportación Keynote/PPTX y soporte prioritario.

## Próximos Pasos (Evolución Continua)
- [ ] Refinar la exportación a PPTX para que el diseño de las diapositivas sea más "pastoral" y visualmente impactante.
- [x] Implementar auto-guardado robusto con sincronización visual en el frontend.
- [x] Mejorar mapeo de recursos externos (Bible Hub Interlineal y Mapas).
- [ ] Explorar la integración de mapas bíblicos o cronologías dinámicas dentro del flujo de estudio.

## Infraestructura y CI/CD
- **CI/CD:** Pipeline en **GitHub Actions** (Lint, Format, Types con Mypy/Ruff, Tests).
- **Release Automation:** Script de CLI para generación de notas de versión basado en commits.
- **Hosting:** Railway (Backend) y Supabase (Base de datos y Auth).
- **Remotos:** Sincronización obligatoria en `github` y `origin`.
