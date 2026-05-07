# Frontend Implementation: Intelligent Restaurant Management System

This document describes the architectural structure and the application of SOLID principles in the Intelligent Restaurant Management System frontend.

## 1. Frontend Structure

The project follows a **Feature-Driven Architecture**, where each business domain (Auth, Menu, Order, KDS, Table Management) is encapsulated within its own module. This promotes high cohesion and low coupling.

### Directory Layout
```text
intelligent-restaurant-fe/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── (admin)/          # Admin-facing pages (Analytics)
│   ├── (auth)/           # Authentication pages (Login)
│   ├── (chef)/           # Chef-facing pages (KDS)
│   ├── (customer)/       # Customer-facing pages (Menu)
│   └── (staff)/          # Staff-facing pages (Tables)
├── components/           # Shared UI components (shadcn/ui)
├── features/             # Business Logic (Feature-Driven)
│   ├── [feature-name]/
│   │   ├── components/   # Reusable feature-specific UI
│   │   ├── config/       # Domain types & Zod schemas
│   │   └── data-access/  # API interfaces, classes, and Query hooks
├── lib/                  # Shared utilities and global config
└── providers/            # Global context providers (Realtime, Query)
```

### Key Module Components
- **Providers**: Located at the root level to avoid confusion with route paths. These provide global functionality like TanStack Query and Realtime event handling.
- **Config**: Centralizes domain definitions using TypeScript and Zod. This acts as the "Single Source of Truth" for data structures.
- **Data-Access**:
    - **Interfaces**: Define the contract for API operations (DIP).
    - **Concrete Classes**: Provide implementations for both `Mock` (local storage) and `Real` (REST API) environments.
    - **Queries**: Encapsulate TanStack Query hooks to manage caching, invalidation, and server-state.
- **Components**: Functional UI parts that consume data through feature-specific hooks.

---

## 2. SOLID Principles Application

### S - Single Responsibility Principle (SRP)
Each module and file has a dedicated responsibility:
- **`*.api.ts`**: Handles the network layer and data persistence logic only.
- **`*.queries.ts`**: Manages server state, caching, and loading indicators.
- **`*.config.ts`**: Defines data contracts and validation.
- **Components**: Focused purely on UI rendering and user interaction.

### O - Open/Closed Principle (OCP)
The system is open for extension but closed for modification through:
- **Interface-Driven API**: We can add new environments (e.g., `TestApi`, `StagingApi`) by creating new classes that implement the existing API interface without touching any query or component logic.
- **Component Props**: Reusable components like `MenuCard` accept callback props, allowing their behavior to be extended by parents without modifying their internal code.

### L - Liskov Substitution Principle (LSP)
Our **Mock/Real API** pattern is a direct implementation of LSP:
- Both `MockMenuApi` and `RealMenuApi` strictly implement `IMenuApi`.
- The application can switch between them at runtime via `CONFIG.IS_MOCK` without affecting correctness. Any component using the API is guaranteed to work regardless of which "subtype" instance it receives.

### I - Interface Segregation Principle (ISP)
Instead of a monolithic API or Type file, we use **Feature-Segregated Interfaces**:
- `IAuthApi`, `IMenuApi`, `IOrderApi`, and `IKdsApi` are separate.
- A component in the Menu feature only depends on `IMenuApi`. It is never forced to know about KDS or Table Management methods, reducing dependency bloat and cognitive load.

### D - Dependency Inversion Principle (DIP)
High-level modules depend on abstractions (Interfaces), not low-level details (Fetch/LocalStorage):
- **Hook Abstractions**: Pages and components use hooks like `useItems()` or `usePlaceOrder()`.
- **Inverted Control**: The query hooks depend on the **Interface** (e.g., `IMenuApi`), while the specific implementation (Mock vs. Real) is "injected" at the API export level. This allows us to swap the entire backend implementation without changing a single line of UI code.
