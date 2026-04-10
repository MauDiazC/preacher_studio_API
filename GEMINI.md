# Preacher Studio API (Sermon Management)

Plataforma especializada de mentoría homilética diseñada para ayudar a guías espirituales a profundizar en el estudio de la Palabra con asistencia digital avanzada de nivel académico.

## Mandatorio: Principio de Blindaje
**TODO LO QUE ESTÉ MARCADO COMO "BLINDADO" NO SE TOCA.** Una funcionalidad o diseño blindado ha alcanzado su estado óptimo de excelencia y estabilidad. Cualquier cambio futuro debe respetar rigurosamente la estructura, el estilo y el comportamiento establecido, evitando regresiones visuales o funcionales.

## Visión y Lenguaje del Proyecto

- **Tono Ministerial:** Se utiliza: *Asistencia Homilética Digital*, *Mentoría Teológica*, *Estudio del Texto Original*. Se prefiere "Guía Espiritual" sobre "Pastor".
- **Calibre Académico:** El análisis incluye información de léxicos profesionales (Strong, Thayer, BDB) y fuentes académicas clásicas.

## Estado Actual (v1.5 - Infrastructure & Auth ✅)

Se ha finalizado la integración de pagos y la autenticación real, blindando la experiencia de usuario y la persistencia de datos.

- **Identidad Visual "Sacred Observatory" (BLINDADO):** 
    - UI blindada en Landing, Pricing, Login, Registro, Lista de Estudios y Editor.
    - Sistema de traducciones (i18n) robusto e insensible a mayúsculas/minúsculas.
    - Sidebar y Header con formato académico fijo y responsivo.
- **Autenticación Real (Google OAuth & Email):**
    - Implementación nativa con Supabase SDK en el frontend.
    - Cierre de sesión asíncrono con limpieza profunda de tokens.
    - Redirección inteligente en `App.tsx` que evita rebotes al landing.
    - Trigger en base de datos para creación automática de perfiles.
- **Pagos y Créditos:**
    - Webhook de Stripe implementado para `checkout.session.completed`.
    - Lógica de actualización automática de créditos y planes en Supabase.
- **Exportación PPTX (BLINDADO):**
    - Generación de diapositivas con estética "Sacred" (Fondo oscuro, acentos oro/púrpura, pie de página institucional y slide de cierre "Soli Deo Gloria").

## Próximos Pasos
- [ ] **Optimización de IA:** Refinar los prompts para asegurar que los análisis mantengan siempre el rigor académico solicitado.
- [ ] **Módulo de Notificaciones:** Implementar notificaciones push o emails tras la generación exitosa de un estudio largo.
- [ ] **Dashboard de Administrador:** Crear la vista para gestionar usuarios y monitorear créditos globales.

## Punto de Restauración (v1.5 - 10/04/2026)
- **Estado:** Infraestructura de pagos lista, Auth real funcionando, UI/UX blindada y profesional.
- **Commit de Referencia:** `f84c69fd` (Fix silent 401 handling and async logout).

## Infraestructura y CI/CD
- **Hosting:** Railway (Backend/Frontend) y Supabase (DB/Auth).
- **Remotos:** Sincronización automática obligatoria en `github` y `origin`.
