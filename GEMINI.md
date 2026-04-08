# Preacher Studio API (Sermon Management)

Plataforma especializada de mentoría homilética diseñada para ayudar a pastores y predicadores a profundizar en el estudio de la Palabra con asistencia digital avanzada de nivel académico.

## Visión y Lenguaje del Proyecto

- **Tono Ministerial:** Se evita estrictamente el término "IA". Se utiliza: *Asistencia Homilética Digital*, *Mentoría Teológica*, *Estudio del Texto Original*.
- **Calibre Académico:** El análisis incluye información de léxicos profesionales (Strong, Thayer, BDB) y fuentes académicas clásicas.

## Estado Actual (v1.3 - Sacred Checkout ✅)

El sistema ha unificado su lenguaje visual y ha preparado la infraestructura para la monetización.

- **Identidad Visual "Sacred Observatory":** 
    - Implementación total en Landing, Pricing, Login, Registro, Lista de Estudios, Editor y la nueva **Página de Checkout**.
    - Unificación de Navbar global con efectos `backdrop-blur-3xl` y tipografía Noto Serif.
- **Flujo de Suscripción:** 
    - Navegación lógica conectada: `Landing -> Pricing -> Checkout`.
    - Página de Checkout dinámica que recibe parámetros de plan (`/checkout/:planId`) y muestra beneficios específicos.
- **Frontend & UX:** 
    - **Sidebar Consolidado:** Los elementos de control (idioma, créditos, logout) están integrados en el sidebar, eliminando la necesidad de Navbar superior en rutas internas.
    - **i18n:** Soporte completo de etiquetas de pago y confirmación en ES/EN.

## Membresías (Planes)

1.  **Sembrador (Free):** 3 Estudios/mes.
2.  **Mentor (Pro):** 25 Estudios/mes + Contexto Histórico.
3.  **Exégeta (Teams):** Estudios Ilimitados + Léxico Pro + Soporte Prioritario.

## Próximos Pasos (Pendientes)
- [ ] **Backend (Stripe):** Implementar el endpoint de Webhook para procesar eventos `checkout.session.completed`.
- [ ] **Lógica de Créditos:** Crear la función en el backend para actualizar automáticamente los créditos en la tabla `profiles` tras una compra exitosa.
- [ ] **Refinamiento PPTX:** Adaptar la exportación a diapositivas al nuevo sistema de diseño "Sacred".

## Punto de Restauración (v1.3 - 08/04/2026)
- **Estado:** UI completa, navegación de pago conectada, listo para integración de Stripe.
- **Commit de Referencia:** `da1fd427` (Implementación de Checkout Page y nuevo Navbar).

## Infraestructura y CI/CD
- **Hosting:** Railway (Backend) y Supabase (DB/Auth).
- **Remotos:** Sincronización automática obligatoria en `github` y `origin`.
