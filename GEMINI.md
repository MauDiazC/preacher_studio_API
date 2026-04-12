# Preacher Studio API (Sermon Management)

Plataforma especializada de mentoría homilética diseñada para ayudar a guías espirituales a profundizar en el estudio de la Palabra con asistencia digital avanzada de nivel académico.

## Mandatorio: Principio de Blindaje
**TODO LO QUE ESTÉ MARCADO COMO "BLINDADO" NO SE TOCA.** Una funcionalidad o diseño blindado ha alcanzado su estado óptimo de excelencia y estabilidad. Cualquier cambio futuro debe respetar rigurosamente la estructura, el estilo y el comportamiento establecido, evitando regresiones visuales o funcionales.

## Visión y Lenguaje del Proyecto

- **Tono Ministerial:** Se utiliza: *Asistencia Homilética Digital*, *Mentoría Teológica*, *Estudio del Texto Original*. Se prefiere "Guía Espiritual" sobre "Pastor".
- **Calibre Académico:** El análisis incluye información de léxicos profesionales (Strong, Thayer, BDB) y fuentes académicas clásicas.

## Estado Actual (v1.6 - Full Subscription Flow & Profile ✅)

Se ha completado la integración total del ciclo de vida del usuario, desde el registro inteligente hasta la gestión de suscripciones y exportaciones profesionales.

- **Identidad Visual "Sacred Observatory" (BLINDADO):** 
    - UI blindada en Landing, Pricing, Login, Registro, Lista de Estudios, Editor y Settings.
    - **Sidebar Unificado (BLINDADO):** Componente común en todas las vistas que muestra dinámicamente el plan actual (Sembrador, Mentor, Ministerio).
- **Autenticación & Redirección (BLINDADO):**
    - Flujo de Google OAuth estabilizado con selector de cuenta forzado y bypass de hidratación en `App.tsx`.
    - Redirección post-auth inteligente: lleva al usuario a su intención original (Dashboard o Checkout de plan elegido).
- **Gestión de Pagos & Planes (BLINDADO):**
    - Integración real con Stripe: Sesiones de Checkout y Webhooks para altas, renovaciones, fallos y cancelaciones.
    - **Portal de Cliente:** Acceso directo desde Ajustes para gestionar métodos de pago y planes en Stripe.
    - **Feature Gating:** Restricción automática de recursos premium (Léxicos) y exportaciones según el nivel del plan.
- **Perfil Ministerial (BLINDADO):**
    - Formulario de ajustes funcional con persistencia en DB para: nombre, ministerio, rol, país, bio y estilo de mentoría.
- **Exportación PPTX/PDF (BLINDADO):**
    - Generación y descarga real de archivos mediante lógica de Blob, con estética institucional "Sacred".

## Próximos Pasos
- [ ] **Optimización de IA:** Refinar los prompts para asegurar que los análisis mantengan siempre el rigor académico solicitado.
- [ ] **Módulo de Notificaciones:** Implementar notificaciones push o emails tras la generación exitosa de un estudio largo.
- [ ] **Dashboard de Administrador:** Crear la vista para gestionar usuarios y monitorear créditos globales.

## Punto de Restauración (v1.6 - 10/04/2026)
- **Estado:** MVP funcional completo. Pagos, Auth, Perfiles y Exportaciones blindadas.
- **Commit de Referencia:** `8d85412c` (fix: remove unused lastSavedLabel state in SermonEditor).

## Infraestructura y CI/CD
- **Hosting:** Railway (Backend/Frontend) y Supabase (DB/Auth).
- **Remotos:** Sincronización automática obligatoria en `github` y `origin`.
