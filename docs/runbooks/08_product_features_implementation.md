# 08 - Implementación de Funcionalidades de Producto

Procedimiento para implementar las características pendientes que añaden valor directo al usuario final.

## 1. Búsqueda y Filtrado de Sermones
1.  **Backend:** Añadir parámetros de consulta (`search`, `status`, `from_date`, `to_date`) al endpoint `GET /sermons`.
2.  **SQL:** Implementar búsqueda `ILIKE` en los campos `title`, `theme` y `content` de la tabla `sermons`.
3.  **Frontend:** Diseñar una barra de búsqueda y filtros rápidos en el panel principal.

## 2. Exportación a PDF y Word
1.  **Dependencias:**
    ```bash
    uv add reportlab python-docx
    ```
2.  **Endpoints:** Crear `/sermons/{id}/export/pdf` y `/sermons/{id}/export/word`.
3.  **Lógica:** Transformar el contenido del sermón (título, bosquejo, referencias) en un documento con formato profesional y devolverlo como un stream de archivos.

## 3. Gestión de Perfil de Pastor
- **Campos de Perfil:** Añadir una tabla `profiles` vinculada a `auth.users` en Supabase.
- **Preferencias de Mentoría:** Almacenar el estilo de mentoría preferido para que Gemini personalice las respuestas según el pastor.
- **Endpoints:** Implementar `GET /profile` y `PUT /profile`.

## 4. Historial de Versiones
- **Lógica de Versiones:** Permitir que Gemini genere diferentes versiones de un mismo bosquejo.
- **Visualización:** Implementar un selector en el frontend para navegar entre las distintas versiones generadas de un sermón.
- **Persistencia:** Asegurar que todas las versiones se guarden en la base de datos vinculadas al ID principal del sermón.
