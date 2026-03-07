# 07 - Integración y Despliegue Continuo (CI/CD)

Procedimiento para automatizar el ciclo de vida del software, desde el commit hasta el despliegue en producción.

## 1. Configuración de GitHub Actions
1.  **Directorio de Workflows:** Crear `.github/workflows/main.yml`.
2.  **Linting y Formateo:** Añadir un paso para ejecutar `ruff check .` y `ruff format --check .`.
3.  **Pruebas Automatizadas:** Ejecutar `pytest` en el runner de GitHub.
4.  **Type Checking:** Ejecutar `mypy .` para asegurar integridad de tipos.

## 2. Automatización del Despliegue
- **Railway Hook:** Configurar Railway para que solo despliegue si el pipeline de GitHub Actions finaliza con éxito.
- **Docker Build:** Verificar que la imagen Docker se construye correctamente en cada Push a la rama principal (`main`).

## 3. Entornos Separados (Staging vs Production)
1.  **Ramas:** Utilizar `develop` para Staging y `main` para Producción.
2.  **Configuración de Railway:** Crear dos servicios en Railway, uno vinculado a cada rama, con sus propias variables de entorno y bases de datos (si aplica).
3.  **Promoción:** Implementar un flujo de aprobación manual antes de desplegar en producción.

## 4. Gestión de Versiones (Releases)
- **Tagging:** Utilizar `git tag` para marcar versiones estables (ej: `v1.0.0`).
- **Release Notes:** Automatizar la generación de notas de versión basadas en los mensajes de commit.
