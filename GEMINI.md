# Preacher Studio API (Sermon Management)

Plataforma especializada de mentoría homilética diseñada para ayudar a pastores y predicadores a profundizar en el estudio de la Palabra con asistencia digital avanzada.

## Visión y Lenguaje del Proyecto

- **Tono Ministerial:** El proyecto evita términos técnicos como "IA" o "Inteligencia Artificial" en la interfaz de usuario. Se prefiere un lenguaje teológico y homilético: *Asistencia Homilética*, *Mentoría Digital*, *Estudio Exegético*, *Profundidad de la Palabra*.
- **Propósito:** Facilitar la preparación del mensaje dominical mediante análisis literarios, históricos y teológicos rápidos pero profundos.

## Arquitectura Actualizada

- **Backend:** FastAPI (Python 3.13+) con inyección de dependencias para el cliente de base de datos.
- **Base de Datos:** Supabase (PostgreSQL).
- **Seguridad (Crítico):** 
    - **RLS Desactivado:** Las tablas (`sermons`, `profiles`, etc.) tienen el RLS desactivado para permitir que el backend gestione la lógica de propiedad y permisos mediante el `user_id`.
    - **Sincronización de Perfiles:** El backend sincroniza automáticamente `full_name` y `email` desde los metadatos de Supabase Auth cada vez que se crea un estudio o se consulta el perfil.
- **Asistencia Teológica:** Integración con modelos de lenguaje avanzados (Gemini 1.5 Flash / GPT-4o-mini) para generación de exégesis.

## Estructura de Membresías (Planes)

1.  **Sembrador (Gratis):** 3 Estudios exegéticos al mes. Ideal para inicio ministerial.
2.  **Mentor ($9.99/mes):** 25 Estudios exegéticos al mes. Incluye contextos históricos y exportación PDF.
3.  **Exégeta ($19.99/mes):** Estudios ILIMITADOS. Exportación a Keynote/PPTX y personalización de estilo homilético.

## Convenciones de Desarrollo

- **Frontend:** React + TypeScript. Layouts ultra-rígidos (Grid/Flex) para evitar solapamientos en el editor.
- **Estilos:** Uso de variables CSS. Títulos de análisis en **Púrpura** (`--accent-purple`).
- **Validación de Pasajes:** El sistema normaliza automáticamente entradas como "juan. 316" o "jan 3:16" a un formato estético ("Juan 3:16").
- **Exportación:** Soporte para PDF y PPTX (compatible con Keynote). El sistema realiza un auto-guardado antes de generar el archivo.

## Despliegue
- **Remotos:** Sincronización obligatoria en `github` y `origin`.
- **Hosting:** Railway (Despliegue automático tras push).
