---
name: eztqm-frontend-dev
description: Governs all frontend development for ezTQM. Enforces modular, IoC-based architecture using React 19, TypeScript 5, and EzUX.
---
# SKILL: Frontend Development — ezTQM

## Identity

| Field | Value |
|-------|-------|
| **Skill ID** | `eztqm-frontend-dev` |
| **Version** | `1.0.0` |
| **Domain** | Frontend Engineering |
| **Stack** | React 19 · TypeScript 5.9 · Tailwind 4.2 · Vite 7.3 · TanStack Ecosystem · EzUX |

---

## Purpose

Governs all frontend development for ezTQM. Enforces a modular, IoC-based architecture using the latest React features (Concurrent mode, Actions, Suspense), TypeScript 5.9, and the EzUX component library. Focuses on visual excellence, performance, and maintainability through OOPS principles and Inversion of Control.

**CRITICAL DIRECTIVE**: Always prioritize the TanStack ecosystem (Query, Router, Table, Form, Virtual) for complex frontend interactions. Only fall back to alternative external libraries if a feature is entirely unsupported by TanStack.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer (React 19 Components)        │
│  EzLayout, EzTable, EzScheduler, EzKanban, etc. │
├─────────────────────────────────────────────────┤
│  State Management Layer (Zustand / IoC Stores)   │
│  Modular stores with dependency injection       │
├─────────────────────────────────────────────────┤
│  Service Layer (Business Logic / API)            │
│  OOPS-based services for data orchestration     │
├─────────────────────────────────────────────────┤
│  Dependency Injection / IoC Container            │
│  Registry for services and stores               │
├─────────────────────────────────────────────────┤
│  Infrastructure Layer (API Clients / Mock Data)  │
│  Core HTTP client with retry and caching        │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

```
```
react@19            — UI library with modern actions and suspense
react-dom@19        — Web rendering
typescript@5.9      — Type safety with advanced decorators and enums
tailwindcss@4.2     — Utility-first CSS with native design system
vite@7.3            — Next-generation frontend tooling
ezux                — Core component library (Layout, Tables, Kanban, etc.)
shadcn/ui           — Accessible, customizable UI components
lucide-react        — Modern, minimal icon set
zustand             — Lightweight state management
@tanstack/react-query   — Data fetching, caching, and synchronization
@tanstack/react-router  — Type-safe routing
@tanstack/react-table   — Headless UI for building powerful tables
@tanstack/react-form    — Robust form state management
@tanstack/react-virtual — Virtualization for long lists
zod                 — Runtime schema validation
i18next             — Internationalization (i18n) and RTL support
```

---

## Folder Structure (Modular & Tree-Shakable)

```
frontend/
├── src/
│   ├── app/                        # Root application setup
│   │   ├── providers/              # Global context providers (IoC, Query, etc.)
│   │   ├── routes/                 # Lazy-loaded route definitions
│   │   └── main.tsx                # Entry point
│   ├── modules/                    # Feature-based modularity
│   │   ├── dashboard/
│   │   │   ├── components/         # Internal components
│   │   │   ├── services/           # Module-specific services
│   │   │   ├── stores/             # Module-specific stores
│   │   │   ├── models/             # Domain interfaces
│   │   │   └── index.ts            # Sub-exports for tree shaking
│   │   └── settings/
│   ├── shared/                     # Reusable logic across modules
│   │   ├── components/             # Wrapper components (EzTable, EzSignature)
│   │   ├── hooks/                  # Global custom hooks
│   │   ├── services/               # Base service classes
│   │   ├── utils/                  # Pure utility functions
│   │   └── styles/                 # Global CSS & Tailwind config
│   ├── core/                       # IoC and Infrastructure
│   │   ├── di/                     # Container and Registry logic
│   │   ├── api/                    # HTTP clients and interceptors
│   │   └── base/                   # Abstract base classes
│   └── assets/                     # Logos, images, fonts
├── public/
├── package.json
└── tsconfig.json
```

---

## Design Patterns & Principles

### Inversion of Control (IoC)
Modules should depend on abstractions (interfaces), not concrete implementations. A central DI container should manage service lifecycles.

```typescript
// core/di/container.ts
export interface IServiceRegistry {
  authService: IAuthService;
  apiService: IApiService;
}

export const Container = new Registry<IServiceRegistry>();
```

### OOPS & Service Modularity
Use Class-based services to encapsulate business logic and API interactions. Avoid functional sprawl.

```typescript
// shared/services/BaseService.ts
export abstract class BaseService {
  protected abstract endpoint: string;
  constructor(protected readonly api: IApiClient) {}
}

// modules/kpi/services/KPIService.ts
export class KPIService extends BaseService {
  protected endpoint = '/api/v1/kpi';
  
  async getDashboardData(id: string) {
    return this.api.get(`${this.endpoint}/dashboard/${id}`);
  }
}
```

### Lazy Loading & Virtualization
- **Lazy Loading**: Use `React.lazy` and `Suspense` for all module entry points.
- **Virtualization**: Use `EzTable` (built-in virtualization) or `react-virtuoso` for data-intensive views.

---

## Component Guidelines (ezux Integration)

The application MUST use `ezux` components as the primary UI building blocks:

- **Main Layout**: `EzLayout` (Includes Logo, Notification, Color Switcher, i18n, RTL).
- **Data Display**: `EzTable` for all tabular data (built-in filtering, sorting, virtualization).
- **Planning**: `EzScheduler` for calendar and scheduling views.
- **Workflow**: `EzKanban` for process tracking.
- **Navigation**: `EzTreeView` for hierarchical data navigation.
- **Forms**: `EzSignature` for electronic signatures.

---

## Agent Instructions

When working on ezTQM frontend tasks, Claude MUST:

1. **Prioritize Visual Excellence**: Ensure designs are premium, modern, and high-contrast. Use Tailwind 4.2 for granular spacing and smooth transitions.
2. **TanStack First Rule**: You MUST aggressively use TanStack libraries (Query, Router, Table, Form, Virtual) before reaching for any other npm community packages.
3. **Follow IoC Patterns**: Register new services in the DI container. Never instantiate services directly inside components.
4. **Use OOPS for Logic**: Encapsulate state transition and API logic within classes (Services/Stores).
5. **Enforce Modular Sub-exports**: Only export what is necessary from a module's `index.ts` to ensure efficient tree shaking.
6. **Implement Lazy Loading**: Wrap module-level routes in `Suspense` with elegant loading skeletons.
7. **Responsive by Default**: Every component and page must be fully responsive and support RTL languages.
8. **No Code Duplication**: Extract common logic to `shared/` components or hooks.
9. **TypeScript 5.9 Features**: Use `const` enums, template literal types, and decorators where appropriate to enhance type safety.
10. **React 19 Hooks**: Utilize `useActionState` and `useFormStatus` for modern form handling.
11. **Aesthetics**: Avoid basic HTML elements; use `ezux`, `shadcn`, and `lucide` for a professional finish.
