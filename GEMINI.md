# Preacher Studio API (Sermon Management)

Plataforma especializada de mentoría homilética diseñada para ayudar a pastores y predicadores a profundizar en el estudio de la Palabra con asistencia digital avanzada de nivel académico.

## Visión y Lenguaje del Proyecto

- **Tono Ministerial:** Se evita estrictamente el término "IA". Se utiliza: *Asistencia Homilética Digital*, *Mentoría Teológica*, *Estudio del Texto Original*.
- **Calibre Académico:** El análisis incluye información de léxicos profesionales (Strong, Thayer, BDB) y fuentes académicas clásicas.

## Estado Actual (Professionalized ✅ - v1.1 Preliminar)

El sistema ha alcanzado una versión preliminar estable tras una fase de depuración intensa y refinamiento de la experiencia de usuario.

- **Arquitectura Backend:** 
    - FastAPI v1 (`/api/v1/`) con inyección de dependencias.
    - **Endpoint DELETE:** Implementado para gestión completa del ciclo de vida del sermón.
    - **IA Multilingüe:** Soporte completo para análisis en Español e Inglés (KJV/NIV automáticas según contexto).
- **Calidad y Estabilidad:** 
    - Cobertura de tests del 99%.
    - **Migraciones:** Gestión profesional de DB mediante **Alembic** (Columna `key_locations` añadida).
- **Seguridad:** 
    - Rate Limiting (`slowapi`) y sanitización rigurosa de entradas.
    - Bypass de administrador para `mdiazcabr@gmail.com`.
- **Frontend & UX:** 
    - **Internacionalización (i18n):** UI y mensajes de carga totalmente localizados (ES/EN).
    - **Editor Robusto:** Sistema de inyección de contenido basado en estados que garantiza la carga instantánea de estudios guardados.
    - **Persistencia de Formato:** Guardado mediante `innerHTML` para mantener estilos visuales en la base de datos.
    - **Validación de Pasajes:** Limpieza automática de citas bíblicas (ej: "John 3=>17" -> "John 3:17").
- **Recursos Homiléticos:** 
    - Mapeo dinámico a **Bible Hub** (Interlineal y Atlas de Mapas).
    - Traducción inteligente de lugares geográficos para compatibilidad con el Atlas (ej: "Antioquía" -> `antioch`).

## Membresías (Planes)

1.  **Sembrador (Gratis):** 3 Estudios/mes. Análisis literario básico.
2.  **Mentor ($9.99/mes):** 25 Estudios/mes. Contexto histórico completo y exportación PDF/Word.
3.  **Exégeta ($19.99/mes):** Estudios ILIMITADOS. Léxico profesional, exportación Keynote/PPTX y soporte prioritario.

## Próximos Pasos (Evolución Continua)
- [ ] Refinar la exportación a PPTX para que el diseño de las diapositivas sea más "pastoral" y visualmente impactante.
- [x] Implementar auto-guardado robusto con sincronización visual en el frontend.
- [x] Internacionalización completa del flujo exegético (IA + UI).
- [ ] Explorar la integración de mapas bíblicos o cronologías dinámicas interactivas.

## Punto de Restauración (v1.1 - 08/04/2026)
- **Estado:** Estable, profesionalizado y funcional en multi-idioma.
- **Commit de Referencia:** `85c22f65` (Restauración de detalle académico Strong/Thayer).

## Infraestructura y CI/CD
- **CI/CD:** Pipeline en **GitHub Actions**.
- **Hosting:** Railway (Backend) y Supabase (DB/Auth).
- **Remotos:** Sincronización automática obligatoria en `github` y `origin`.
