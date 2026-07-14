# Architecture

This document will evolve as features are implemented.

## Folder roles

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router routes, layouts, and pages |
| `components/` | Shared UI (layout shell, reusable blocks, shadcn `ui/`) |
| `features/` | Feature modules (UI + feature actions co-located) |
| `actions/` | Cross-cutting server actions |
| `lib/` | Low-level utilities (e.g. `cn`, DB client) |
| `models/` | Mongoose schemas |
| `services/` | Business / data-access layer |
| `hooks/` | Client React hooks |
| `types/` | Shared TypeScript types |
| `utils/` | Non-UI helpers |
| `constants/` | App-wide constants |
| `providers/` | Client-side React providers |
| `validators/` | Zod schemas |
| `docs/` | Project documentation |

## Documentation index

| Doc | Description |
|-----|-------------|
| [database-architecture.md](./database-architecture.md) | Base collections, fields, indexes, ER |
| [04-database-design.md](./04-database-design.md) | Addendum: settings, holidays, CMS strategy, enums, base schema |
| [03-system-architecture.md](./03-system-architecture.md) | System layers, authz, flows, strategies |
| [api/00-api-guidelines.md](./api/00-api-guidelines.md) | API foundation (auth envelope, errors, docs standards) |

## Current phase

**Phase 0 — Project scaffolding complete.**  
**Phase 1a — Database planning complete** (+ [04-database-design.md](./04-database-design.md) addendum).  
**Phase 1b — System architecture complete** (see [03-system-architecture.md](./03-system-architecture.md), sections 1–23).  

No Mongoose models, auth wiring, or APIs yet.
