# Design System Document: Ministerial Excellence

## 1. Overview & Creative North Star: "The Sacred Observatory"
The Creative North Star for this design system is **"The Sacred Observatory."** It envisions a digital workspace that feels like a quiet, high-end study overlooking the cosmos—where the vastness of divine order meets the intimate focus of pastoral preparation. 

We break away from "SaaS-standard" layouts by prioritizing depth, atmospheric gradients, and editorial weight. The goal is to move the user from a feeling of "data management" to "Inspired Preparation." We achieve this through:
*   **Intentional Asymmetry:** Breaking the rigid grid to allow for "Study Profound" moments, where text and imagery overlap like pages of an ancient manuscript.
*   **Atmospheric Depth:** Using "celestial orbits" (subtle radial gradients) to draw the eye toward primary actions without the need for loud, distracting elements.
*   **Pastoral Authority:** Balancing modern technical performance with the timeless weight of serif typography.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in a deep, ministerial dark mode. We use color to suggest a "divine order" rather than a utilitarian dashboard.

### Core Palette (Material Tokens)
*   **Background (`#111127`):** The foundational "Infinite" dark.
*   **Primary (`#b0c6ff`):** A soft, celestial blue. Use this for "Inspiration" points and main navigation.
*   **Secondary (`#c2c1ff`):** A muted violet for subtle accents and secondary actions.
*   **Surface (`#111127`):** To be used for the base level of the application.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Boundaries must be defined solely through:
1.  **Background Color Shifts:** Use `surface-container-low` vs. `surface-container-high` to distinguish areas.
2.  **Tonal Transitions:** Use a 2px blur on a container edge with a 10% opacity `primary` color to suggest a border without "cutting" the canvas.

### Signature Textures & Glassmorphism
*   **The Celestial Gradient:** Main CTAs (like "Elegir Plan" or "Comenzar Estudio") must use a linear gradient from `primary` (#b0c6ff) to `primary-container` (#558dff) at a 135-degree angle.
*   **Frosted Sanctum:** Floating menus or modals should utilize a **Glassmorphism** effect: `surface-container` color at 70% opacity with a `24px` backdrop-blur. This ensures the "orbits" of the background bleed through, maintaining the sense of depth.

---

## 3. Typography: The Editorial Voice
We contrast the traditional with the contemporary to represent "Ancient Truth, Modern Management."

| Level | Token | Font Family | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Noto Serif | 3.5rem | 700 | "Profound Study" Headers |
| **Headline**| `headline-md`| Noto Serif | 1.75rem | 600 | Ministerial Section Titles |
| **Title** | `title-md` | Plus Jakarta Sans | 1.125rem | 500 | Component Labels / Card Titles |
| **Body** | `body-md` | Plus Jakarta Sans | 0.875rem | 400 | General Content / Reading |
| **Label** | `label-sm` | Inter | 0.6875rem | 600 | Metadata / Small Caps Utility |

**The Typographic Hierarchy:** Use `display-lg` Serif for high-level inspiration. Transition to `Plus Jakarta Sans` for functional areas to ensure that "Gestión Ministerial" (Ministerial Management) remains legible and efficient.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "tech-heavy." We use **Ambient Light** and **Stacking**.

*   **The Layering Principle:** 
    *   **Base:** `surface` (#111127)
    *   **Section:** `surface-container-low` (#191930)
    *   **Interactive Card:** `surface-container-high` (#28283f)
*   **Ambient Shadows:** For floating elements, use a diffused shadow: `0px 20px 40px rgba(0, 0, 0, 0.4)`. The "shadow" should feel like a natural absence of light, not a black smudge.
*   **The "Ghost Border" Fallback:** If accessibility requires a border (e.g., input fields), use the `outline-variant` token at **15% opacity**. This creates a "breath" of a line rather than a hard boundary.

---

## 5. Components: Ministerial Tools

### Buttons (The "Inspired Action")
*   **Primary:** Gradient fill (`primary` to `primary-container`), `0.75rem` roundedness, with a soft `primary` glow (8px blur, 20% opacity) on hover.
*   **Secondary:** Ghost style. No background, `outline-variant` at 20% opacity, with `primary` text.
*   **Micro-interaction:** On press, the button should scale to 0.98 and the gradient should slightly shift "shimmer" to suggest a pulse of light.

### Cards & Lists (The "Library" View)
*   **No Dividers:** Forbid the use of horizontal lines. Use `1.5rem` (xl) vertical spacing to separate list items.
*   **Selected State:** Instead of a border, use a subtle radial gradient in the background corner using `secondary-container`.

### Input Fields (Preparation Fields)
*   **Style:** `surface-container-highest` background. No border.
*   **Focus State:** The `outline` should glow with a `primary` color at 30% opacity. Label shifts to `primary` color.

### Key Ministerial Components
*   **Study Ribbon:** A floating glassmorphic bar at the top of "Estudio Profundo" (Profound Study) sessions containing progress markers.
*   **Inspiration Chips:** Used for tagging sermon themes. Use `secondary-container` with `on-secondary-container` text. Roundedness: `full`.

---

## 6. Do's and Don'ts

### Do
*   **Do** use vertical white space aggressively. Ministerial work requires "room to breathe."
*   **Do** use serif headings for any concept related to "Theology," "Sermon," or "Scripture."
*   **Do** use subtle background orbits (radial gradients: `#2979FF` at 5% opacity) to anchor asymmetrical layouts.
*   **Do** refer to all data-entry tasks as "Preparación Inspirada" (Inspired Preparation).

### Don't
*   **Don't** use any "Sparkle" or "Robot" icons. We are building for human wisdom and divine inspiration, not artificial automation.
*   **Don't** use high-contrast 1px borders. It shatters the "Sacred Observatory" atmosphere.
*   **Don't** use bright, saturated red for errors. Use the `error` (#ffb4ab) token which is a soft, urgent pastel that fits the dark theme.
*   **Don't** crowd the interface. If a screen feels full, move secondary details into a "Ghost Border" drawer.