# Krati Dental Care

Mobile-first dental clinic management system for [Krati Dental Care](https://www.dentalcarejaipur.com).

Patients book appointments, manage their profile, and access prescriptions. Staff use a dashboard for scheduling, patients, e-prescriptions, medicines, inbox, website content, and clinic settings.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Clerk** — authentication (sign-in / sign-up, webhooks)
- **MongoDB** + **Mongoose** — data layer
- **React Hook Form** + **Zod** — forms and validation
- **Resend** — transactional appointment emails
- **Puppeteer** / Chromium — prescription PDF generation
- **Vercel Analytics**
- ESLint + Prettier + `tsx` tests

## Features

### Public site

- Marketing pages: home, doctors, services, contact, FAQ, privacy, terms
- Online appointment booking with availability and rate limiting
- Email action links (confirm / cancel / reschedule)
- Patient profile (signed-in users)

### Staff dashboard (`/dashboard`)

- Overview and recent activity
- Appointments and scheduling (slots, holidays, overrides)
- Patients, documents, and e-prescriptions (including PDF / print)
- Medicine catalog
- Contact inbox and notifications
- Clinic settings, FAQs, and user management

### Roles

| Role | Access |
|------|--------|
| `admin` | Full staff dashboard |
| `user` | Public site + patient surfaces |

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB database
- [Clerk](https://clerk.com) application

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Minimum required values:

   | Variable | Purpose |
   |----------|---------|
   | `NEXT_PUBLIC_APP_URL` | App origin (e.g. `http://localhost:3000`) |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
   | `CLERK_SECRET_KEY` | Clerk secret key |
   | `MONGODB_URI` | MongoDB connection string |

   Optional (see `.env.example`): Resend email, Clerk webhook secret, booking rate limits, Chromium / PDF paths, Cloudinary, demo seed flags.

3. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Seed demo data** (optional, development only)

   Set `ALLOW_DEMO_SEED=true` in `.env.local`, then:

   ```bash
   npm run seed
   ```

   Reset (destructive — requires `ALLOW_DEMO_SEED_RESET=true` for non-local DBs):

   ```bash
   npm run seed:reset
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run dev:clean` | Clear `.next` and start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check Prettier formatting |
| `npm test` | Run feature unit tests |
| `npm run seed` | Seed demo data |
| `npm run seed:reset` | Reset and re-seed demo data |
| `npm run migrate:user-roles` | Consolidate legacy staff roles → `user` |

## Project structure

```
app/                 # App Router routes (public, auth, dashboard, API)
components/
  ui/                # shadcn/ui primitives
  layout/            # Shells, navbar, error UI
  website/           # Marketing page sections
  dashboard/         # Dashboard chrome and shared dashboard UI
  shared/            # Cross-feature UI
features/            # Feature modules (actions, services, components)
actions/             # Cross-cutting server actions
lib/                 # Auth, DB, rate-limit, SEO, utilities
models/              # Mongoose models
services/            # Shared business / data-access helpers
validators/          # Zod schemas
providers/           # React providers
hooks/               # Client hooks
constants/           # App-wide constants
config/              # Feature config (e.g. booking rate limits)
types/               # Shared TypeScript types
utils/               # Non-UI helpers
scripts/             # Seeders and migrations
docs/                # Architecture and API notes
public/              # Static assets
```

See [docs/architecture.md](docs/architecture.md) for folder roles and deeper design docs.

## Path aliases

`@/*` maps to the project root (configured in `tsconfig.json`).

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/architecture.md](docs/architecture.md) | Folder roles and doc index |
| [docs/03-system-architecture.md](docs/03-system-architecture.md) | Layers, auth, flows, security |
| [docs/database-architecture.md](docs/database-architecture.md) | Collections, indexes, ER |
| [docs/appointment-booking-architecture.md](docs/appointment-booking-architecture.md) | Booking flow |
| [docs/scheduling-architecture.md](docs/scheduling-architecture.md) | Slot generation |
| [docs/appointment-email-workflow.md](docs/appointment-email-workflow.md) | Email actions |
| [docs/api/](docs/api/) | API guidelines and endpoint notes |
| [AGENTS.md](AGENTS.md) | Coding conventions for contributors / agents |

## License

Private — all rights reserved.
