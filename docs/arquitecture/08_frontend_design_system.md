# 08 - Design System Frontend - Preacher Studio

Este documento define las bases visuales y de UX para el frontend de **Preacher Studio**. Dado que es una herramienta de estudio y mentoría homilética, el diseño debe ser **sobrio, inspirador y extremadamente legible**.

## 1. Principios de Diseño
- **Enfoque en el Contenido:** El texto del sermón es el protagonista. La interfaz debe ser limpia (minimalista) para evitar distracciones.
- **Jerarquía Clara:** Uso de espacios en blanco y tipografía para guiar al pastor a través de la estructura del sermón (Bosquejo -> Contenido -> Aplicación).
- **Asistencia no Intrusiva:** La IA (Gemini) debe aparecer como un "mentor a un lado", no como un obstáculo.

## 2. Paleta de Colores (Zen Light)
Se propone una paleta que evite la fatiga visual durante largas horas de estudio.

| Color | Hex | Uso |
| :--- | :--- | :--- |
| **Primario (Sage)** | `#4A6741` | Acentos, botones principales, logos (Transmite calma y crecimiento). |
| **Fondo (Off-White)** | `#F9F7F2` | Fondo de la aplicación (Evita el blanco puro para reducir fatiga). |
| **Texto Principal** | `#1A1A1A` | Cuerpo del texto y títulos. |
| **Texto Secundario** | `#6B7280` | Notas al pie, metadatos, descripciones de IA. |
| **Acento IA (Gold)** | `#D4AF37` | Sugerencias de Gemini, resaltados de versículos importantes. |
| **Error/Alerta** | `#991B1B` | Mensajes críticos de guardado. |

## 3. Tipografía
- **Títulos:** `Playfair Display` (Serif) - Para dar un toque de solemnidad y autoridad bíblica.
- **Cuerpo/Editor:** `Inter` o `Roboto` (Sans-Serif) - Para máxima legibilidad en dispositivos digitales.
- **Citas Bíblicas:** `Libre Baskerville` (Italic) - Para diferenciar claramente la palabra de Dios del comentario del pastor.

## 4. Componentes Clave de UI

### 4.1 El Editor Homilético (ZenEditor)
- Área de texto expansiva sin bordes visibles.
- Barra de herramientas flotante que solo aparece al seleccionar texto.
- Contador de palabras y tiempo estimado de predicación en una esquina discreta.

### 4.2 Sidebar de Mentoría (Gemini Panel)
- Panel colapsable a la derecha.
- Tarjetas de sugerencias con bordes redondeados y sombra suave.
- Botón de "Aplicar a mi sermón" que inserta el texto de la IA en la posición del cursor.

### 4.3 Dashboard de Sermones
- Grid de tarjetas que muestran el Título, Pasaje Principal y una etiqueta de estado (`seed`, `outline`, `draft`).
- Barra de búsqueda rápida en la parte superior.

## 5. Estados y Feedback Visual
- **Guardando (Auto-save):** Un pequeño spinner o check en la barra de estado superior.
- **IA Pensando:** Una sutil animación de pulso en el icono de Gemini.
- **Error de Conexión:** Banner superior en color arena/rojo suave con opción de reintentar.

---

## 6. Respuesta a Análisis de Imágenes
**Sí, puedo analizar imágenes.** Una vez definido este sistema, puedes subir capturas de pantalla de tu frontend y podré:
1. Comparar si los colores y tipografías coinciden con esta propuesta.
2. Evaluar la jerarquía visual y el espacio en blanco.
3. Sugerir mejoras de accesibilidad y alineación con los principios de diseño establecidos.
