# Frontend Architecture Overview

## Design Principles
- **Monorepo Structure:** Co-located with the backend for consistency.
- **Clean Architecture:** Domain-driven design with clear separation of UI, logic, and data.
- **Atomic UI:** Small, composable components.

## Layers
1. **Components:** Pure UI elements.
2. **Features:** Complex components with business logic.
3. **Hooks:** Encapsulated logic and state.
4. **Services:** API communication (Axios client).
5. **Store:** Global state management (Zustand).

## Styling
- **Vanilla CSS:** CSS Variables for theming.
- **Flexbox/Grid:** Responsive layouts without external CSS frameworks.
