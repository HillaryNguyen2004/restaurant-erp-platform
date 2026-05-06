# SOLID Principles: Interface-Driven Frontend Architecture

We have evolved our frontend architecture to use **Interface-Driven Design**, which significantly strengthens our adherence to SOLID principles.

## S - Single Responsibility Principle (SRP)
Each class and folder has one clear responsibility:
- **`IKdsApi` (Interface)**: Defines the contract for KDS operations.
- **`MockKdsApi` (Concrete Class)**: Implements KDS operations using `localStorage` for development/testing.
- **`RealKdsApi` (Concrete Class)**: Implements KDS operations using real `fetch` calls to the backend.
- **`data-access/kds.queries.ts`**: Handles state management (caching, loading states) using TanStack Query. 

### Architectural Consistency
Every feature must have a `*.queries.ts` file, even if simple. This ensures that:
1. **Components never call APIs directly**: They only interact with hooks.
2. **State is centralized**: All data fetching logic (cache keys, stale times) is managed in one place.
3. **Decoupling**: The UI is decoupled from the underlying data-fetching library (e.g., if we swapped TanStack Query for SWR, only the `.queries.ts` files would change).

## O - Open/Closed Principle (OCP)
The system is open for extension but closed for modification:
- **New Environments**: If we need to add a "Testing" environment with a different data source, we can simply create a `TestKdsApi` class implementing `IKdsApi`. We don't need to change any of the queries or UI components.
- **Component Behavior**: UI components remain closed to modification because they receive behaviors (like adding to a cart) via props.

## L - Liskov Substitution Principle (LSP)
**"Subtypes must be substitutable for their base types."**
- Our concrete API classes (`MockMenuApi`, `RealMenuApi`) are perfect substitutes for each other because they both strictly implement the `IMenuApi` interface. 
- The query hooks (e.g., `useItems`) don't care which implementation is provided; they interact with the interface, ensuring the application's correctness regardless of the data source.

## I - Interface Segregation Principle (ISP)
We prevent "fat interfaces" by segregating our API contracts:
- Instead of a single `IApi` for the whole app, we have `IAuthApi`, `IMenuApi`, `IOrderApi`, and `IKdsApi`. 
- This ensures that the Menu feature is not forced to know about or depend on KDS methods, keeping the architecture decoupled and focused.

## D - Dependency Inversion Principle (DIP)
This is the cornerstone of our latest refactor:
- **Depend on Abstractions**: Our query hooks and components depend on the **Interface** (`IMenuApi`), not the concrete implementation (`MockMenuApi`).
- **Inversion of Control**: The decision of which implementation to use is centralized in the API files (`export const menuApi: IMenuApi = ...`). The high-level business logic is no longer dependent on low-level network details.

---

### Why this matters
By moving to Class-based Interface implementations, we have created a **Pluggable Architecture**. We can swap out entire microservices or mock the entire system for local development without touching a single line of UI code.
