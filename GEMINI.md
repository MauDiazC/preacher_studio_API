# Preacher Studio API (Sermon Management)

Plataforma especializada de mentoría homilética diseñada para ayudar a pastores y predicadores a profundizar en el estudio de la Palabra con asistencia digital avanzada de nivel académico.

## Visión y Lenguaje del Proyecto

- **Tono Ministerial:** Se evita estrictamente el término "IA". Se utiliza: *Asistencia Homilética Digital*, *Mentoría Teológica*, *Estudio del Texto Original*.
- **Calibre Académico:** El análisis debe incluir información de léxicos profesionales (Strong, Thayer, BDB) para justificar el valor de la suscripción.

## Estado Actual de la Arquitectura

- **Backend:** FastAPI con inyección de `db`.
- **Seguridad:** RLS desactivado en Supabase (gestión total vía backend). Bypass de administrador activo para `mdiazcabr@gmail.com`.
- **Análisis Exegético:** 
    - Incluye comparativa RVR1960/NVI.
    - Desglose de idiomas originales (Griego/Hebreo) con Números de Strong.
    - Atribución de fuentes (Barclay, Henry, Kittel, etc.).
- **Frontend:** 
    - Layout ultra-rígido para evitar solapamientos.
    - Carga robusta de estudios mediante intervalos de verificación del DOM.
    - Panel de "Recursos Originales" dinámico con mapeo de libros (Español -> Inglés) hacia Bible Hub.

## Membresías (Planes)

1.  **Sembrador (Gratis):** 3 Estudios/mes. Análisis literario básico.
2.  **Mentor ($9.99/mes):** 25 Estudios/mes. Contexto histórico completo y exportación PDF.
3.  **Exégeta ($19.99/mes):** Estudios ILIMITADOS. Léxico profesional, exportación Keynote/PPTX y soporte prioritario.

## Próximos Pasos (Hoja de Ruta)
- [ ] Refinar la exportación a PPTX para que el diseño de las diapositivas sea más "pastoral".
- [ ] Implementar auto-guardado silencioso mientras el pastor edita.
- [ ] Explorar la integración de mapas bíblicos o cronologías dinámicas.

## Despliegue
- **Remotos:** Sincronización obligatoria en `github` y `origin`.
- **Hosting:** Railway.
