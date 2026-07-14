# Krati Dental Care

Mobile-first Dental Clinic Management System built with Next.js App Router.

Patients can book appointments and view prescriptions. Admins manage slots, doctors, patients, e-prescriptions, and website content.

> **Current status:** Phase 0 — project scaffolding only. No authentication, database, or business logic yet.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Clerk (installed, not wired)
- MongoDB + Mongoose (installed, not wired)
- React Hook Form + Zod
- ESLint + Prettier

## Prerequisites

- Node.js 20+
- npm 10+

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Fill in values when you reach the auth and database phases. The app runs without them for now.

3. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check Prettier formatting |

## Project structure

```
app/                 # Routes, layouts, pages (App Router only)
components/
  ui/                # shadcn/ui primitives
  layout/            # App shells, header, footer
  shared/            # Cross-feature UI
features/            # Feature modules (appointments, prescriptions, …)
actions/             # Cross-cutting server actions
lib/                 # Low-level utilities (cn, db client)
models/              # Mongoose models (later)
services/            # Business / data-access layer (later)
hooks/               # Client hooks
types/               # Shared TypeScript types
utils/               # Non-UI helpers
constants/           # App-wide constants
providers/           # React providers (later)
validators/          # Zod schemas (later)
docs/                # Architecture notes
public/              # Static assets
```

See [docs/architecture.md](docs/architecture.md) for folder roles.

## Path aliases

`@/*` maps to the project root (configured in `tsconfig.json`).

## Next phases (recommended order)

1. Environment + MongoDB connection utility
2. Clerk authentication and role strategy (admin / patient)
3. Core Mongoose models
4. Appointment booking and slot management
5. E-prescriptions
6. Admin dashboard and website content CMS

## License

Private — all rights reserved.
