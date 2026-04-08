# Preacher Studio API (Sermon Management)

Plataforma especializada de mentoría homilética diseñada para ayudar a pastores y predicadores a profundizar en el estudio de la Palabra con asistencia digital avanzada de nivel académico.

## Visión y Lenguaje del Proyecto

- **Tono Ministerial:** Se evita estrictamente el término "IA". Se utiliza: *Asistencia Homilética Digital*, *Mentoría Teológica*, *Estudio del Texto Original*.
- **Calibre Académico:** El análisis incluye información de léxicos profesionales (Strong, Thayer, BDB) y fuentes académicas clásicas.

## Estado Actual (v1.2 - Sacred Observatory ✅)

El sistema ha completado su transición a una identidad visual de alta gama y ha estabilizado sus funciones principales.

- **Identidad Visual "Sacred Observatory":** 
    - Implementación total en Landing, Pricing, Login, Registro, Lista de Estudios y Editor.
    - Uso de **Noto Serif** (Autoridad) y **Plus Jakarta Sans** (Gestión).
    - Efectos de "Celestial Orbits" y Glassmorphism ("Frosted Sanctum") en toda la interfaz.
- **Arquitectura Backend & IA:** 
    - **IA Multilingüe:** Prompt optimizado para responder en ES/EN, forzando versiones bíblicas correctas (RVR1960/NVI o KJV/NIV).
    - **Sincronización de Formato:** Persistencia completa de `innerHTML` que permite guardar negritas, colores y estructuras del editor.
    - **Validación Robusta:** Limpieza automática de citas bíblicas y manejo de errores de validación JSON en el fallback.
- **Frontend & Navegación:** 
    - **Navbar Inteligente:** Se oculta automáticamente en las rutas internas para dar paso al Sidebar.
    - **Sidebar Integrado:** Control de créditos, idioma y logout unificados en el menú vertical.
    - **Dashboard de Lista:** Nuevo grid de estadísticas y tarjetas de estudio con efectos de micro-interacción.

## Membresías (Planes)

1.  **Sembrador (Gratis):** 3 Estudios/mes. Análisis literario básico.
2.  **Mentor ($9.99/mes):** 25 Estudios/mes. Contexto histórico completo y exportación PDF/Word.
3.  **Exégeta ($19.99/mes):** Estudios ILIMITADOS. Léxico profesional, exportación Keynote/PPTX y soporte prioritario.

## Próximos Pasos (Mañana)
- [ ] Refinar la exportación a PPTX para que coincida con el nuevo sistema de diseño "Sacred".
- [ ] Implementar animaciones de transición entre páginas para reforzar la fluidez.
- [ ] Revisar la responsividad detallada de la nueva Landing Page en dispositivos móviles pequeños.

## Punto de Restauración (v1.2 - 08/04/2026)
- **Estado:** Identidad visual completa, IA estable y navegación lógica conectada.
- **Commit de Referencia:** `3ec39d12` (Rediseño total Landing/Navbar).

## Infraestructura y CI/CD
- **Hosting:** Railway (Backend) y Supabase (DB/Auth).
- **Remotos:** Sincronización automática obligatoria en `github` y `origin`.
