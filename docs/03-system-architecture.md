# 03 — System Architecture

**Project:** Krati Dental Care — Dental Clinic Management System  
**Status:** Architecture planning (no application code in this document)  
**Related:** [database-architecture.md](./database-architecture.md) · [architecture.md](./architecture.md)

---

## Document goals

This document defines how the application is structured, how requests flow, how auth/authz work, and how layers collaborate. It is the engineering contract for implementation phases that follow.

**Guiding constraints**
- Next.js App Router only (no Pages Router)
- TypeScript everywhere
- Server Components by default; Client Components only when required
- Server Actions for mutations; Route Handlers only when necessary (webhooks, file streaming, external callbacks)
- MongoDB + Mongoose for persistence
- Clerk for authentication
- Feature-based modules
- Mobile-first UI

---

## 1. High-Level System Architecture

### 1.1 Context diagram

```
                         ┌─────────────────────────────────────┐
                         │              Clients                 │
                         │  Mobile browser │ Desktop browser    │
                         └─────────────────┬───────────────────┘
                                           │ HTTPS
                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         Next.js Application (Vercel / Node)               │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Public Web │  │ Patient App  │  │ Admin App   │  │ Doctor Portal*  │  │
│  │  (CMS UI)  │  │ (book / Rx)  │  │ (ops / CMS) │  │ (optional v1.x) │  │
│  └─────┬──────┘  └──────┬───────┘  └──────┬──────┘  └────────┬────────┘  │
│        └────────────────┴─────────────────┴──────────────────┘           │
│                                  │                                         │
│         Server Components · Server Actions · Middleware · Route Handlers   │
│                                  │                                         │
│         features/ · services/ · models/ · validators/ · providers/         │
└──────────────────────────────────┼─────────────────────────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
   ┌───────────────┐      ┌────────────────┐      ┌─────────────────┐
   │ Clerk         │      │ MongoDB Atlas  │      │ Cloudinary      │
   │ Auth / Sessions│      │ (Mongoose ODM) │      │ (files / PDFs)* │
   └───────────────┘      └────────────────┘      └─────────────────┘

* Doctor UI may reuse admin capabilities in v1; Cloudinary in a later phase.
```

### 1.2 Trust boundaries

| Boundary | Inside | Outside |
|----------|--------|---------|
| Browser | UI rendering, client hooks, Clerk client SDK | Never DB credentials / secret keys |
| Next.js server | Server Actions, services, Mongoose, secrets | Exposed only via vetted UI/actions |
| Clerk | Identity, sessions, JWTs | Not clinic domain truth |
| MongoDB | Domain data (`users`, `slots`, …) | No auth password storage |
| Cloudinary | Binary assets | Metadata references live in MongoDB |

### 1.3 Runtime topology (v1)

- **Single Next.js deployable** hosting public site + patient portal + admin.
- **Route groups** separate UX/layouts without separate services.
- **MongoDB** as primary datastore (single cluster, single database for one clinic v1).
- **Clerk** as hosted IdP (no custom password flows).

---

## 2. Application Layers

Layers are **logical**. Code lives primarily under feature modules, with shared infrastructure in `lib/`, `services/`, `models/`.

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation                                                │
│  app/**/page.tsx · layouts · feature UI · shadcn components │
│  Server Components (default) · Client Components (sparse)     │
└─────────────────────────────┬───────────────────────────────┘
                              │ calls
┌─────────────────────────────▼───────────────────────────────┐
│  Application / Use-case                                      │
│  Server Actions (features/*/actions, actions/)               │
│  Authz checks · Zod parse · orchestration · result mapping   │
└─────────────────────────────┬───────────────────────────────┘
                              │ calls
┌─────────────────────────────▼───────────────────────────────┐
│  Domain Services                                             │
│  services/*  (booking, prescriptions, slots, content, …)     │
│  Business rules · transactions · invariants                  │
└─────────────────────────────┬───────────────────────────────┘
                              │ uses
┌─────────────────────────────▼───────────────────────────────┐
│  Persistence                                                 │
│  models/* (Mongoose) · lib/db (connection)                   │
│  Indexes · schema constraints · lean queries                 │
└─────────────────────────────┬───────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   MongoDB Atlas   │
                    └───────────────────┘

Cross-cutting: validators/ · types/ · constants/ · lib/logger · middleware
```

### 2.1 Layer responsibilities

| Layer | Owns | Must not own |
|-------|------|--------------|
| Presentation | Layout, accessibility, mobile UX, loading/error UI | Direct Mongoose calls, secrets |
| Application (Actions) | Input validation, authz gate, DTO mapping, revalidation | Fat business rules duplicated across actions |
| Domain services | Booking atomicity, Rx lifecycle, soft-delete rules | JSX, Clerk UI widgets |
| Persistence | Schemas, indexes, queries | HTTP status codes, toast copy |
| Infrastructure | DB connect, logging, Cloudinary client, Clerk helpers | Feature-specific business rules |

### 2.2 Design decision — why services between actions and models?

**Justification:** Server Actions become thin entry points; booking/Rx rules stay testable and reusable from cron/webhooks later without importing React. Models stay dumb data access; services encode invariants (e.g. slot `available → booked`).

---

## 3. Feature-Based Architecture

### 3.1 Feature modules (v1)

| Feature | Actor focus | Core capabilities |
|---------|-------------|-------------------|
| `appointments` | Patient + Admin | Book, cancel, list history, admin manage |
| `slots` | Admin (+ Doctor later) | Create/block/cancel dynamic slots |
| `prescriptions` | Admin/Doctor + Patient | Issue, amend/void, view, download |
| `doctors` | Admin | CRUD doctor profiles, availability flags |
| `patients` | Admin (+ self patient profile) | Manage patients, link portal users |
| `website` | Admin + Public | Manage `clinic_contents`; render public pages |
| `auth` (thin) | All | Clerk wiring, role bootstrap, guards |

Optional later: `notifications`, `files`, `audit`.

### 3.2 Feature module shape

```
features/<feature>/
  components/     # Feature-specific UI (SC/CC as needed)
  actions/        # Server Actions for this feature
  types.ts        # Feature-local types (optional)
  index.ts        # Public exports for the feature
```

Shared concerns stay outside features:
- `services/` — reusable domain logic (may be `services/appointments.ts` mirroring feature names)
- `models/` — Mongoose schemas
- `validators/` — Zod schemas shared by actions and forms

### 3.3 Module dependency overview

```
                    app/ (routes)
                       │
                       ▼
              features/*/components
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   features/*/actions  hooks/   components/ui|shared|layout
          │
          ▼
      validators/  +  auth guards (lib/auth*)
          │
          ▼
       services/
          │
          ▼
        models/  ←── lib/db
          │
          ▼
       MongoDB

Allowed:
  app → features → services → models
  features → components/ui, validators, constants, types

Forbidden:
  models → features | app
  services → features/components | app
  components → models | mongoose
  Client Components → secrets | direct DB
```

### 3.4 Design decision — co-locate actions with features

**Justification:** Appointment booking UI and `bookAppointment` action change together. Cross-cutting actions (e.g. “get current app user”) live in `actions/` or `lib/auth`.

---

## 4. Folder Responsibilities

Aligned with the scaffolded repository:

| Path | Responsibility |
|------|----------------|
| `app/` | Routes, layouts, route groups, loading/error boundaries, metadata. No business rules. |
| `app/(public)/` | Marketing / public clinic site (recommended group). |
| `app/(patient)/` | Patient portal routes (recommended group). |
| `app/(admin)/` | Admin console routes (recommended group). |
| `app/api/` | Rare Route Handlers: Clerk webhooks, Cloudinary signed hooks, PDF stream if needed. |
| `components/ui/` | shadcn primitives only. |
| `components/layout/` | Shells, nav, responsive chrome. |
| `components/shared/` | Cross-feature presentational blocks. |
| `features/` | Feature UI + feature Server Actions. |
| `actions/` | Cross-feature Server Actions only. |
| `services/` | Domain / use-case logic, transactions. |
| `models/` | Mongoose schemas & model exports. |
| `lib/` | DB connection, auth helpers, logger, Cloudinary client, `cn()`. |
| `validators/` | Zod schemas (single source of truth for input shapes). |
| `types/` | Shared TS types / result unions. |
| `constants/` | Roles, routes, status enums (TS consts). |
| `hooks/` | Client-only hooks (forms helpers, media queries). |
| `providers/` | ClerkProvider and other client providers. |
| `utils/` | Pure helpers (dates, phone format) with no React/DB. |
| `docs/` | Architecture & planning docs. |
| `public/` | Static assets only. |

### 4.1 Recommended App Router groups (implementation phase)

```
app/
  (public)/
    page.tsx              # Home
    about/…
  (auth)/
    sign-in/[[...]]/…
    sign-up/[[...]]/…
  (patient)/
    layout.tsx            # Requires role=patient
    appointments/…
    prescriptions/…
  (admin)/
    layout.tsx            # Requires role=admin
    doctors/…
    patients/…
    slots/…
    appointments/…
    prescriptions/…
    content/…
  api/
    webhooks/clerk/route.ts
```

---

## 5. Request Lifecycle

### 5.1 Read path (Server Component)

```
Browser GET /patient/appointments
        │
        ▼
Next.js Middleware (Clerk) ── unauthorized? → redirect /sign-in
        │
        ▼
(app) patient layout ── load session + app user ── role≠patient? → 403/redirect
        │
        ▼
Server Component page
        │
        ├── services.getPatientAppointments(patientId)
        │         │
        │         ├── models.Appointment.find(...)
        │         └── return DTOs
        │
        ▼
RSC payload / HTML streamed to client
```

**Rules**
- Prefer fetching in Server Components / services — not `useEffect` for initial data.
- Pass serializable props only into Client Components.

### 5.2 Mutation path (Server Action)

```
Client form / button
        │
        ▼
Server Action (features/appointments/actions/book.ts)
        │
        ├── 1. auth: requireAppUser()
        ├── 2. authz: assertRole / assertOwnership
        ├── 3. validate: Zod safeParse
        ├── 4. service: bookingService.book(input)
        │         ├── start Mongo session/transaction
        │         ├── slot conditional update (available→booked)
        │         ├── create appointment
        │         └── commit / abort
        ├── 5. revalidatePath / revalidateTag
        └── 6. return ActionResult { ok, data | error }
        │
        ▼
Client receives result → toast / redirect / form errors
```

### 5.3 Webhook path (Route Handler)

```
Clerk → POST /api/webhooks/clerk
        │
        ├── verify Svix signature
        ├── map event (user.created/updated/deleted)
        ├── upsert users collection
        └── 200 OK
```

### 5.4 When to use Route Handlers vs Server Actions

| Use Server Actions | Use Route Handlers |
|--------------------|--------------------|
| Form posts from own UI | External webhooks (Clerk) |
| In-app mutations | Third-party callbacks |
| Co-located with RSC forms | Binary streaming endpoints if required |
| | Public machine APIs (future mobile app) |

---

## 6. Authentication Flow

**Identity provider:** Clerk  
**App profile store:** MongoDB `users` (see database architecture)

### 6.1 Sign-up / first login

```
Patient/Admin visits sign-up/sign-in (Clerk hosted/UI components)
        │
        ▼
Clerk authenticates → session cookie / JWT
        │
        ▼
Middleware allows protected route
        │
        ▼
First authenticated server touch:
  getAppUser()
        │
        ├── find users by clerkId
        │     └── found → return
        └── not found → create users row
              role default: patient (admin provisioned separately)
              link/create patients profile for patient role
```

### 6.2 Session usage on server

```
auth() from @clerk/nextjs/server
   → clerkUserId
   → load Mongo users by clerkId
   → attach role + patientId/doctorId to request context helper
```

### 6.3 Admin provisioning

- Do **not** allow public self-elevate to `admin`.
- Seed first admin via secure env/script or Clerk publicMetadata + locked sync rules.
- Recommended v1: store authoritative `role` in MongoDB `users`; optionally mirror to Clerk `publicMetadata.role` for edge middleware checks.

### 6.4 Design decisions

| Decision | Justification |
|----------|---------------|
| Clerk owns passwords/MFA | Reduce security surface; faster compliance path |
| Mongo `users` owns role | Domain queries & joins without calling Clerk Admin API on every request |
| Webhook sync | Keeps email/status eventual-consistent if user edits profile in Clerk |
| Default new user = patient | Safest default; clinic staff created by admin |

---

## 7. Authorization Strategy

### 7.1 Roles

| Role | Capabilities (v1) |
|------|-------------------|
| `patient` | Book available slots; view own appointments; view/download own issued prescriptions; edit limited own profile |
| `admin` | Manage doctors, patients, slots, appointments, prescriptions, website content |
| `doctor` | (v1 optional) Manage own slots / issue Rx for assigned patients — may be deferred; admin covers clinical ops initially |

### 7.2 Enforcement layers (defense in depth)

```
1. Middleware / layout     → must be signed in for portal/admin trees
2. Role gate in layouts    → (admin) requires role=admin
3. Server Action authz     → every mutation checks role + ownership
4. Service invariants      → e.g. patientId on booking must match caller (unless admin)
5. Query filters           → patient queries always scoped by patientId
```

**Never** rely on hiding UI alone.

### 7.3 Ownership rules (examples)

| Action | Allowed if |
|--------|------------|
| Book slot | `patient` (self) or `admin` (on behalf of patient) |
| Cancel appointment | Owner patient **or** admin |
| List prescriptions | Owner patient **or** admin |
| Download Rx PDF | Same as list + status `issued`/`amended` |
| Create slot | `admin` (or `doctor` for self later) |
| Manage doctors/content | `admin` only |

### 7.4 Authorization helper pattern (conceptual)

- `requireAuth()` → Clerk session or throw/redirect
- `requireAppUser()` → Mongo user + active check
- `requireRole("admin")`
- `requirePatientAccess(patientId)` → self or admin
- Return typed errors (`UNAUTHORIZED`, `FORBIDDEN`) — not raw throws to the client

### 7.5 Design decision — RBAC over ABAC in v1

**Justification:** Three roles cover clinic ops. Attribute-based rules (per-resource ACLs) add complexity without demand. Ownership checks cover the main multi-tenant-within-clinic case (patients see only their data).

---

## 8. Error Handling Strategy

### 8.1 Error taxonomy

| Kind | Examples | Client treatment |
|------|----------|------------------|
| Validation | Zod failures | Field-level form errors |
| Auth | No session | Redirect to sign-in |
| Authz | Wrong role / not owner | 403 page or action error |
| Domain | Slot already booked | Friendly conflict message |
| Not found | Missing appointment | 404 |
| Infrastructure | DB timeout | Generic 500 + log id |

### 8.2 Action result contract (conceptual)

```
ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string[]> }
```

Avoid leaking stack traces, Mongo errors, or internal ids beyond what UX needs.

### 8.3 UI boundaries

```
app/
  error.tsx                 # segment error UI
  not-found.tsx
  (admin)/error.tsx         # admin-specific fallback
  (patient)/error.tsx
```

- Unexpected errors → Next error boundary + logged `requestId`
- Expected domain failures → returned as `ActionResult`, not thrown across the wire when avoidable

### 8.4 Design decision — Result objects for mutations

**Justification:** Server Actions that `throw` for every validation miss complicate form UX. Discriminated unions keep mobile forms predictable.

---

## 9. Logging Strategy

### 9.1 Goals

- Debug production incidents without PII sprawl
- Trace booking races and webhook failures
- Support future audit trail (clinical voids/cancels)

### 9.2 Levels

| Level | Use |
|-------|-----|
| `debug` | Dev-only verbose |
| `info` | Significant business events (booked, issued Rx) |
| `warn` | Recoverable anomalies (retryable webhook) |
| `error` | Failed transactions, unhandled exceptions |

### 9.3 What to log

**Do log:** `requestId`, `userId` (Mongo), `clerkId` hash/truncated if needed, action name, entity ids, duration, error codes.  
**Do not log:** prescription full medication payloads by default, phone/email in plaintext at `info` in production (prefer redaction), secrets, raw webhook bodies with PII at `info`.

### 9.4 Placement

| Place | Log |
|-------|-----|
| Middleware | Minimal (avoid noise) |
| Server Actions | Start/fail with `code` |
| Services | Domain conflicts, transaction aborts |
| Webhooks | Signature failure, event type, processing result |
| Global error hooks | Unhandled exceptions + stack (server only) |

### 9.5 Correlation

Generate or propagate `requestId` (header or AsyncLocalStorage) so one booking failure can be traced across action → service → Mongo.

### 9.6 Future

- Ship logs to Vercel/Datadog/Axiom.
- Promote high-risk events into `audit_logs` collection (see database doc).

---

## 10. Validation Strategy

### 10.1 Single source of truth: Zod

```
Client form (RHF) ──@hookform/resolvers──► Zod schema (validators/)
                                              ▲
Server Action ──safeParse─────────────────────┘
```

- Same schema (or shared base + server refine) for client UX and server trust boundary.
- **Server validation is mandatory** even if the client validated.

### 10.2 Layers of validation

| Layer | Tool | Examples |
|-------|------|----------|
| Syntax / shape | Zod | types, string lengths, enums |
| Referential | Service + DB | doctor exists, slot available |
| Invariants | Service | `endAt > startAt`, status transitions |
| Persistence | Mongoose schema | backup constraints, indexes |

### 10.3 Schema organization

```
validators/
  auth.ts
  doctors.ts
  patients.ts
  slots.ts
  appointments.ts
  prescriptions.ts
  clinic-content.ts
  common.ts          # objectId, phone, pagination
```

### 10.4 Design decision — Zod at the edge, Mongoose as safety net

**Justification:** Zod gives structured field errors for RHF; Mongoose catches programmer mistakes and enforces indexes/required at rest. Business transitions (slot status) live in services, not only schemas.

---

## 11. File Upload Strategy

Phase-ready design (Cloudinary when enabled).

### 11.1 Asset types

| Asset | Producer | Consumer | Storage |
|-------|----------|----------|---------|
| Doctor avatar | Admin | Public site | Cloudinary |
| Prescription PDF | Server generate | Patient download | Cloudinary or object storage |
| CMS images | Admin | Public site | Cloudinary |

**Never** store binaries in MongoDB.

### 11.2 Preferred flows

**A. Direct-to-Cloudinary (browser uploads)**  
1. Authenticated action requests signature / upload preset (role-checked).  
2. Client uploads to Cloudinary.  
3. Client sends resulting URL + publicId to Server Action.  
4. Service persists URL on `doctors.avatarUrl` / `clinic_contents.metadata`.

**B. Server-generated PDF**  
1. `prescriptions` issued → service renders PDF.  
2. Server uploads to Cloudinary with folder `prescriptions/{patientId}/`.  
3. Save `pdfUrl` (+ optional `pdfPublicId`) on prescription.  
4. Patient download: authz check → redirect/stream signed URL (time-limited).

### 11.3 Security controls

- Upload allowed only for `admin` (avatars/CMS) or system server (PDFs).
- Validate MIME/size server-side for any server-received files.
- Signed, short-lived URLs for private Rx PDFs (public CMS images may use open CDN URLs).
- Strip EXIF when relevant; fixed allowed formats (jpeg/png/webp/pdf).

### 11.4 Design decision — metadata in Mongo, bytes in CDN

**Justification:** Aligns with database architecture (`pdfUrl`, `avatarUrl`); keeps Atlas small; enables CDN caching for public images without caching private Rx.

---

## 12. Database Interaction Flow

Aligned with [database-architecture.md](./database-architecture.md).

### 12.1 Connection

```
Server Action / RSC / Route Handler
        │
        ▼
lib/db.connect()   # cached connection across hot lambdas
        │
        ▼
Mongoose models
```

- Single connection helper with global cache for serverless.
- All DB access through `models` + `services` (no ad-hoc connects in components).

### 12.2 Read flow

```
Service query
  → Model.find / findOne / aggregate
  → .lean() for read-only DTOs when appropriate
  → map to presentation DTO (hide internal fields)
```

### 12.3 Write flow (booking — critical path)

```
bookingService.book
  → startSession / withTransaction
      1. Load slot with session (status=available, startAt>now)
      2. Create appointment (snapshots, unique slotId)
      3. Update slot status=booked + appointmentId
         (filter includes status=available)
      4. Abort if step 3 matchedCount=0 (race lost)
  → commit
```

Indexes enforcing safety: unique `(doctorId, startAt)` on slots; unique `slotId` on appointments.

### 12.4 Soft delete / status

Clinical entities prefer status/`deletedAt` over hard delete. Services encapsulate legal transitions (see DB doc status machines).

### 12.5 Design decision — transactions for multi-document booking

**Justification:** Slot + appointment must move together; conditional updates alone help but multi-doc transactions give clear abort semantics under concurrency.

---

## 13. State Management Strategy

### 13.1 Principles

1. **Server is the source of truth** for appointments, slots, prescriptions, CMS.
2. **URL + RSC** hold list/filter state where possible (`?status=`, `?date=`).
3. **React local state** only for ephemeral UI (modals, tabs, uncontrolled draft fields).
4. **No global client store (Redux/Zustand) in v1** unless a clear cross-tree client need appears.
5. **React Hook Form** for multi-field forms; Zod resolver for parity with server.

### 13.2 Cache / freshness (Next.js)

| Mechanism | Use |
|-----------|-----|
| `revalidatePath` | After bookings, CMS edits, Rx issue |
| `revalidateTag` | Tagged doctor lists, published content |
| `router.refresh()` | Client confirmation after action |
| Clerk client state | Session/user UI only |

### 13.3 Client Component triggers (allowed)

- Interactive calendars / slot pickers
- Forms with live validation
- Dialogs, dropdowns, optimistic UI (optional, keep conservative)
- Download buttons that call actions then open signed URLs

### 13.4 Design decision — avoid heavy client state libraries

**Justification:** Clinic CRM screens are mutation-light and read-mostly; App Router + Server Actions already solve sync. Adding a global store early creates dual sources of truth.

---

## 14. Caching Strategy

### 14.1 v1 stance

**Keep caching minimal and explicit.** Correctness of slot availability beats aggressive CDN caching of dynamic lists.

| Data | Cache approach |
|------|----------------|
| Public CMS (`clinic_contents` published) | `revalidateTag('content')` or time-based revalidate (e.g. 60–300s) |
| Doctor public profiles | ISR/tag revalidation after admin update |
| Available slots | **No long cache**; always fresh server read near booking |
| Patient appointments / Rx | User-specific; default dynamic; revalidate on mutation |
| Static marketing assets | CDN (Cloudinary / Next Image) |

### 14.2 HTTP / edge

- Public pages may use static generation where content is tag-revalidated.
- `(patient)` and `(admin)` routes: dynamic by default (`force-dynamic` or auth-driven dynamic).

### 14.3 Application-level memoization

- Optional `unstable_cache` / `cache()` for expensive public aggregations only.
- Never cache authorized patient data keyed only by path without user identity.

### 14.4 Future

- Redis for rate limiting / slot hold (soft lock) if traffic grows.
- CDN signed cookie strategy for private PDF access.

### 14.5 Design decision — freshness for booking, cache for marketing

**Justification:** Double-booking risk dominates; marketing pages benefit from cache without clinical risk.

---

## 15. Future Scalability Considerations

| Area | Evolution path |
|------|----------------|
| Tenancy | Add `clinicId` to domain collections; Clerk Organizations ↔ clinics |
| Compute | Split admin heavy jobs (PDF, reminders) into background workers / queues |
| Slots | `schedule_rules` + generator job materializing `slots` |
| Notifications | Outbox collection + WhatsApp/email provider workers |
| Search | Atlas Search for patients & Rx numbers |
| Mobile apps | First-party APIs via Route Handlers + Clerk; reuse `services/` |
| Observability | Structured logs → APM; `audit_logs` for clinical compliance |
| Multi-region | Atlas multi-region; keep App Router region close to DB |
| Rate limits | Per-user booking rate limits at action edge |
| Feature flags | Env or lightweight flags for doctor portal / payments |

**Non-goals that stay deferred:** payments, full EHR charting, multi-branch inventory — attach without rewriting the appointment/Rx core.

---

## ASCII — end-to-end booking sequence

```
Patient                  Next.js                   MongoDB           Clerk
  │                        │                          │                │
  │  GET /book             │                          │                │
  │───────────────────────►│  auth()                  │                │
  │                        │─────────────────────────────────────────►│
  │                        │  session ok              │                │
  │                        │  load users+patient      │                │
  │                        │─────────────────────────►│                │
  │  HTML slots            │◄─────────────────────────│                │
  │◄───────────────────────│                          │                │
  │                        │                          │                │
  │  Server Action book    │                          │                │
  │───────────────────────►│  Zod + authz             │                │
  │                        │  transaction:             │                │
  │                        │   slot→booked            │                │
  │                        │   insert appointment     │                │
  │                        │─────────────────────────►│                │
  │                        │◄──────── ok ─────────────│                │
  │  result + revalidate   │                          │                │
  │◄───────────────────────│                          │                │
```

---

## ASCII — admin Rx issue + patient download

```
Admin UI → Action issuePrescription
             → authz admin/doctor
             → validators
             → prescriptionService.issue
             → (optional) PDF upload Cloudinary
             → save prescriptions.pdfUrl
             → revalidate patient Rx paths

Patient UI → Action/getSignedDownload
             → authz ownership
             → status issued|amended
             → time-limited URL
             → browser download
```

---

## Best practices followed

1. **Server Components by default** — less client JS on mobile.
2. **Trust boundary validation** — Zod on server for every mutation.
3. **Thin actions, rich services** — testable domain layer.
4. **RBAC + ownership** — defense in depth.
5. **Feature folders** — change localization for vertical slices.
6. **No secrets in client bundles** — Clerk publishable key only on client.
7. **Transactional booking** — concurrency-safe slots.
8. **Snapshots for history** — stable clinical timelines.
9. **Soft deletes / status machines** — recoverable ops, audit readiness.
10. **Mobile-first presentation** — layouts and forms designed small-screen first; progressive enhancement for desktop admin tables.
11. **Minimal caching of inventory-like availability** — correctness over micro-optimizations.
12. **TypeScript strictness** — shared types for ActionResult and DTOs.

---

## Design decision log (summary)

| Decision | Choice | Why |
|----------|--------|-----|
| Architecture style | Modular monolith (Next.js) | One clinic product; lowest ops cost; clear split via features |
| Mutations | Server Actions first | Native to App Router; less API boilerplate |
| Auth | Clerk + Mongo roles | Managed identity + queryable RBAC |
| Authorization | RBAC + ownership | Matches actors; simple to reason about |
| Data access | services → mongoose | Protects invariants; avoids UI coupling |
| Files | Cloudinary later | CDN + transformations; DB stays metadata |
| Client state | RSC + RHF | Avoid dual state; mobile-friendly |
| Caching | Tag/path revalidate; no slot CDN cache | Prevent stale availability |
| Multi-tenant | Single clinic now | Complexity deferred; schema reserved |

---

## Implementation readiness checklist

Before writing features, implementers should have:

- [ ] Env vars for Clerk + MongoDB (and Cloudinary when needed)
- [ ] `lib/db` connection utility
- [ ] Mongoose models per database architecture
- [ ] Clerk middleware + provider
- [ ] `requireAppUser` / role helpers
- [ ] Shared `ActionResult` + logger
- [ ] Zod validators for first vertical (slots → appointments)

**Suggested build order:** auth bridge → doctors/patients → slots/appointments → prescriptions → website content → file/PDF polish.

---

## 16. Core Domain Model

### 16.1 Appointment as the central entity

The **Appointment** is the core business entity of the system. Nearly every clinical and operational capability either creates an appointment, transitions its status, or hangs historical/derived records from it.

```
                         Patient
                            │
                            │ 1
                            │
                            ▼ *
                       Appointment
                      /    |    |    \
                     /     |    |     \
                    /      |    |      \
                   ▼       ▼    ▼       ▼
               Doctor    Slot  Prescription  Payment (Future)
                 │         │
                 │         │ (1:1 when booked)
                 └─────────┘
```

| Related entity | Relationship to Appointment | Role in the domain |
|----------------|-----------------------------|--------------------|
| Patient | many appointments → one patient | Who receives care |
| Doctor | many appointments → one doctor | Who delivers care |
| Slot | one appointment ↔ one slot | When care is reserved |
| Prescription | zero-to-many per appointment | Clinical outcome after (or around) the visit |
| Payment (future) | zero-to-one / many per appointment | Commercial settlement for the visit |

### 16.2 Why centering on Appointment simplifies the product

| Future capability | How Appointment as hub helps |
|-------------------|------------------------------|
| Online payments | Charge/refund keyed by `appointmentId`; receipt history stays visit-scoped |
| Notifications | Reminders, confirmations, and follow-ups subscribe to appointment status transitions |
| Analytics | Utilization, no-show rate, revenue, and doctor load all aggregate from appointments |
| Doctor dashboard | “Today’s list” is a filtered appointment query — not a separate domain model |
| Medical history | Visit timeline is ordered appointments (+ linked Rx); patient chart is a projection |
| Follow-up reminders | Schedule next slot from a completed appointment; retain parent/child appointment links later |

### 16.3 Design decision

**Treat Appointment as the aggregation root for clinical visits.** Slots remain inventory; prescriptions remain clinical documents; patients and doctors remain master data. Features compose around appointment lifecycle events rather than inventing parallel “visit” or “encounter” entities in v1.

---

## 17. Business Workflow

### 17.1 Appointment lifecycle

Operational path from inventory to closed care (and optional archival):

```
Available Slot
      │
      │  patient (or admin) books
      ▼
Booked (appointment = PENDING)
      │
      │  admin confirms
      ▼
Confirmed
      │
      │  visit finishes
      ▼
Completed
      │
      │  clinician issues Rx (optional but common)
      ▼
Prescription Issued
      │
      │  retention / soft-close (reporting)
      ▼
Archived
```

| Stage | SlotStatus | AppointmentStatus | Notes |
|-------|------------|-------------------|-------|
| Available Slot | `AVAILABLE` | — | Inventory only |
| Booked | `BOOKED` | `PENDING` | Hold created; awaits clinic confirmation |
| Confirmed | `BOOKED` | `CONFIRMED` | Patient expected |
| Completed | `BOOKED` (historical) | `COMPLETED` | Visit closed |
| Prescription Issued | unchanged | `COMPLETED` | Rx documented via `prescriptions` |
| Archived | unchanged | retained + archive flag/policy | Long-term history; not day-to-day ops queue |

**Alternate paths**
- `PENDING` or `CONFIRMED` → `CANCELLED` (frees or retires slot per cancel policy)
- `CONFIRMED` → `NO_SHOW` (slot consumed; analytics)

### 17.2 Prescription lifecycle

```
Draft
      │
      │  admin/doctor finalizes
      ▼
Issued
      │
      │  patient opens secure download
      ▼
Downloaded (event / audit — status may remain ISSUED)
      │
      │  retention policy / soft-close
      ▼
Archived
```

**Alternate paths**
- `DRAFT` → discarded or left draft (never patient-visible)
- `ISSUED` → `AMENDED` (superseding clinical correction)
- `ISSUED` / `AMENDED` → `VOID` (clinical invalidation with reason)
- `VOID` / `AMENDED` historical versions → `ARCHIVED` under retention

Patient download is an **access event**, not always a terminal status change: retain `ISSUED`/`AMENDED` as document truth; record download in logs/audit for compliance.

### 17.3 Doctor workflow

```
Admin creates doctor profile
      │
      ▼
Doctor ACTIVE (+ accepting appointments)
      │
      ├── Admin/doctor publishes AVAILABLE slots
      ├── Calendar shows CONFIRMED day list
      ├── Visit → mark appointment COMPLETED
      ├── Create Rx DRAFT → ISSUED
      └── Optional: ON_LEAVE / INACTIVE stops new slots
```

Doctors consume appointments and produce clinical artifacts (completion + prescriptions). Slot inventory may be managed by admin on their behalf in v1.

### 17.4 Patient workflow

```
Sign up / sign in (Clerk)
      │
      ▼
Patient profile linked (Mongo patients)
      │
      ├── Browse AVAILABLE slots
      ├── Book → appointment PENDING
      ├── Await / view CONFIRMED visit
      ├── View appointment history
      └── Download ISSUED / AMENDED prescriptions
```

Patients never mutate slot inventory or issue prescriptions; they act on offered availability and their own records.

### 17.5 Admin workflow

```
Operate clinic day-to-day
      │
      ├── Manage doctors / patients / content
      ├── Create/block slots (AVAILABLE / BLOCKED / HOLIDAY)
      ├── Confirm PENDING → CONFIRMED
      ├── Cancel / mark NO_SHOW / COMPLETED
      ├── Issue / amend / void prescriptions
      └── Publish website content
```

Admin is the orchestration role that connects inventory (slots), demand (patients), supply (doctors), and clinical documentation (Rx).

### 17.6 How workflows interact

```
Admin: open slots (AVAILABLE)
        │
        ▼
Patient: book ──────────────► Appointment PENDING + Slot BOOKED
        │
        ▼
Admin: confirm ─────────────► Appointment CONFIRMED
        │
        ▼
Doctor/Admin: complete visit ► Appointment COMPLETED
        │
        ▼
Doctor/Admin: issue Rx ─────► Prescription ISSUED (linked appointmentId)
        │
        ▼
Patient: download Rx ───────► Authorized PDF access + audit event
```

**Interaction rules**
1. Slot workflow gates appointment workflow — no book without `AVAILABLE`.
2. Appointment confirmation is an admin (clinic) signal — reduces no-shows and clarifies schedule.
3. Prescription ideally references a completed (or in-progress) appointment for the same patient/doctor, but must still enforce ownership checks.
4. Patient download depends on prescription lifecycle (`ISSUED`/`AMENDED`) and authz, not on slot state.
5. Cancellation / void paths in one workflow must leave the others consistent (e.g. cancel appointment → release or retire slot; void Rx → patient download denied).

---

## 18. Centralized Status Enums

All workflow statuses are defined **once** in shared constants/enums and reused by validators, Mongoose schemas, services, and UI labels. Do not scatter magic strings across features.

### 18.1 `AppointmentStatus`

| Value | Meaning |
|-------|---------|
| `PENDING` | Booked; awaiting clinic confirmation |
| `CONFIRMED` | Accepted on the schedule |
| `COMPLETED` | Visit finished |
| `CANCELLED` | Voided before completion |
| `NO_SHOW` | Patient did not attend |

### 18.2 `SlotStatus`

| Value | Meaning |
|-------|---------|
| `AVAILABLE` | Open for booking |
| `BOOKED` | Reserved by an appointment |
| `BLOCKED` | Manually closed (break, emergency, maintenance) |
| `HOLIDAY` | Closed for clinic/doctor holiday |

### 18.3 `PrescriptionStatus`

| Value | Meaning |
|-------|---------|
| `DRAFT` | Editable; not patient-visible |
| `ISSUED` | Finalized for patient use |
| `AMENDED` | Superseding correction of a prior issue |
| `VOID` | Invalidated; not for download/use |
| `ARCHIVED` | Retained for history; out of active queues |

### 18.4 `DoctorStatus`

| Value | Meaning |
|-------|---------|
| `ACTIVE` | Visible/operable in clinic workflows |
| `INACTIVE` | Soft-disabled; no new scheduling |
| `ON_LEAVE` | Temporarily not accepting new appointments |

*(Accepting-appointments may remain a boolean flag alongside status if product needs finer control.)*

### 18.5 `PatientStatus`

| Value | Meaning |
|-------|---------|
| `ACTIVE` | Can book and access portal records |
| `INACTIVE` | Portal/booking disabled |
| `ARCHIVED` | Historical record; retained for clinical history |

### 18.6 `ContentStatus`

| Value | Meaning |
|-------|---------|
| `DRAFT` | Editable CMS content; not public |
| `PUBLISHED` | Live on the public site |
| `ARCHIVED` | Retired from public view; kept for rollback/history |

### 18.7 Why centralized enums improve maintainability

| Benefit | Explanation |
|---------|-------------|
| Single source of truth | Renaming or adding a status updates one module, not dozens of string literals |
| Exhaustive TypeScript checks | `switch` / mappings fail compile when a status is forgotten |
| Consistent validation | Zod enums and Mongoose enums stay aligned |
| Safer refactors | UI badges, filters, and analytics share the same vocabulary |
| Clearer audits | Logs and reports emit stable machine values |
| Cross-feature contracts | Appointments, slots, and Rx services speak one language |

**Convention:** Store uppercase enum values in MongoDB (as documented here) or map 1:1 from shared TypeScript enums at the persistence boundary — never invent per-feature synonyms (`scheduled` vs `PENDING`) without an explicit adapter.

---

## 19. Sequence Diagrams

### 19.1 Patient books appointment

```
Patient          Browser           Server Action         BookingService        MongoDB           Clerk
  │                 │                    │                     │                  │                │
  │ select slot     │                    │                     │                  │                │
  │────────────────►│ bookAppointment()  │                     │                  │                │
  │                 │───────────────────►│ requireAppUser      │                  │                │
  │                 │                    │───────────────────────────────────────────────────────►│
  │                 │                    │ role=patient        │                  │                │
  │                 │                    │ Zod validate        │                  │                │
  │                 │                    │────────────────────►│                  │                │
  │                 │                    │                     │ begin txn        │                │
  │                 │                    │                     │─────────────────►│                │
  │                 │                    │                     │ slot AVAILABLE?  │                │
  │                 │                    │                     │ create appt PENDING              │
  │                 │                    │                     │ slot → BOOKED    │                │
  │                 │                    │                     │◄──── commit ─────│                │
  │                 │                    │◄──── ok ────────────│                  │                │
  │                 │◄── ActionResult ───│ revalidatePath      │                  │                │
  │◄── confirmation │                    │                     │                  │                │
```

### 19.2 Admin confirms appointment

```
Admin            Admin UI          Server Action         AppointmentService     MongoDB
  │                 │                    │                     │                  │
  │ open PENDING    │                    │                     │                  │
  │────────────────►│ confirmAppointment │                     │                  │
  │                 │───────────────────►│ requireRole(admin)  │                  │
  │                 │                    │ Zod (appointmentId) │                  │
  │                 │                    │────────────────────►│                  │
  │                 │                    │                     │ load appt        │
  │                 │                    │                     │ status=PENDING?  │
  │                 │                    │                     │ → CONFIRMED      │
  │                 │                    │                     │─────────────────►│
  │                 │                    │◄──── ok ────────────│                  │
  │                 │◄── success ────────│ revalidate admin +  │                  │
  │◄── updated list │   patient paths    │                     │                  │
```

### 19.3 Admin issues prescription

```
Admin            Admin UI          Server Action         RxService           MongoDB      Cloudinary*
  │                 │                    │                  │                   │             │
  │ fill Rx form    │                    │                  │                   │             │
  │────────────────►│ issuePrescription  │                  │                   │             │
  │                 │───────────────────►│ authz admin      │                   │             │
  │                 │                    │ Zod medications  │                   │             │
  │                 │                    │─────────────────►│                   │             │
  │                 │                    │                  │ validate appt/    │             │
  │                 │                    │                  │ patient/doctor    │             │
  │                 │                    │                  │ DRAFT→ISSUED      │             │
  │                 │                    │                  │ snapshots + meds  │             │
  │                 │                    │                  │──────────────────►│             │
  │                 │                    │                  │ generate PDF*     │             │
  │                 │                    │                  │───────────────────────────────►│
  │                 │                    │                  │ store pdfUrl      │             │
  │                 │                    │◄──── ok ─────────│                   │             │
  │◄── issued ──────│◄───────────────────│ revalidate       │                   │             │

* PDF/Cloudinary may be deferred; issue can persist without pdfUrl initially.
```

### 19.4 Patient downloads prescription

```
Patient          Browser           Server Action         RxService          MongoDB       Storage/CDN
  │                 │                    │                  │                  │              │
  │ tap Download    │                    │                  │                  │              │
  │────────────────►│ getPrescriptionDownload              │                  │              │
  │                 │───────────────────►│ require patient  │                  │              │
  │                 │                    │ ownership check  │                  │              │
  │                 │                    │─────────────────►│                  │              │
  │                 │                    │                  │ status ISSUED    │              │
  │                 │                    │                  │ or AMENDED?      │              │
  │                 │                    │                  │─────────────────►│              │
  │                 │                    │                  │ audit download   │              │
  │                 │                    │                  │ signed URL ─────────────────────►│
  │                 │◄── URL / stream ───│◄─────────────────│                  │              │
  │◄── PDF file ────│                    │                  │                  │              │
```

### 19.5 Doctor availability update

```
Admin/Doctor     UI                Server Action         SlotService         MongoDB
  │                 │                    │                  │                  │
  │ set week hours / create slots        │                  │                  │
  │────────────────►│ upsertSlots /      │                  │                  │
  │                 │ updateDoctorAvailability              │                  │
  │                 │───────────────────►│ authz admin      │                  │
  │                 │                    │ (or doctor self) │                  │
  │                 │                    │ Zod windows      │                  │
  │                 │                    │─────────────────►│                  │
  │                 │                    │                  │ doctor ACTIVE?   │
  │                 │                    │                  │ insert slots     │
  │                 │                    │                  │ AVAILABLE        │
  │                 │                    │                  │ or mark BLOCKED/ │
  │                 │                    │                  │ HOLIDAY          │
  │                 │                    │                  │─────────────────►│
  │                 │                    │◄──── ok ─────────│                  │
  │◄── calendar ────│◄── revalidate ─────│                  │                  │
```

---

## 20. Security Considerations

### 20.1 Authentication

- Use Clerk for identity, MFA options, and session lifecycle.
- Resolve Mongo `users` by `clerkId` on the server for every privileged action.
- Reject inactive app users even if Clerk session is valid.

**Reasoning:** Separates IdP concerns from clinic authorization and allows instant clinic-side disable without waiting on session expiry alone.

### 20.2 Authorization

- Enforce RBAC in layouts **and** every Server Action / sensitive Route Handler.
- Apply ownership checks for patient-scoped resources (`patientId` must match caller unless admin).
- Deny by default; grant explicitly per action.

**Reasoning:** UI hiding is not security. Dual enforcement prevents privilege escalation via crafted action calls.

### 20.3 Input validation

- Zod-validate all mutation inputs on the server.
- Enforce enum membership via centralized status enums.
- Bound string lengths and array sizes (medications, notes).

**Reasoning:** Client-side validation improves UX only; attackers bypass it. Schema validation is the trust boundary.

### 20.4 Rate limiting

- Rate-limit booking, sign-in adjacent flows, and download endpoints (edge middleware, WAF, or action wrapper).
- Stricter limits on slot booking to reduce abuse and racing bots.

**Reasoning:** Protects availability fairness and reduces brute-force / scraping of medical identifiers.

### 20.5 CSRF protection

- Prefer SameSite session cookies via Clerk and Next.js Server Actions (origin-aware posting).
- Avoid making state-changing GET routes.
- Verify webhook signatures (Clerk Svix) on Route Handlers.

**Reasoning:** Cross-site write attempts fail when mutations require authenticated same-site action posts and signed webhooks.

### 20.6 XSS prevention

- React’s default escaping for UI text.
- Sanitize or strictly constrain any future rich text/CMS HTML.
- Never use `dangerouslySetInnerHTML` for patient- or admin-supplied clinical notes without a vetted sanitizer.

**Reasoning:** XSS in a medical admin app can exfiltrate PHI across sessions.

### 20.7 Secure HTTP headers

- Configure hardened headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Frame-Ancestors` / clickjacking protections) at the Next.js or platform edge.
- Serve only over HTTPS in production.

**Reasoning:** Defense-in-depth against MIME sniffing, embedding attacks, and mixed-content leakage.

### 20.8 Environment variable handling

- Secrets (`CLERK_SECRET_KEY`, `MONGODB_URI`, Cloudinary secrets) only on server.
- Expose only `NEXT_PUBLIC_*` publishable values to the client.
- Keep `.env*` out of git; commit `.env.example` without secrets.

**Reasoning:** Leaked Mongo or Clerk secrets equal full account takeover and PHI exposure.

### 20.9 PDF access authorization

- Do not serve prescription PDFs from guessable public URLs.
- Authorize ownership/role, then issue short-lived signed URLs (or authenticated streams).
- Deny download for `DRAFT`, `VOID`, and unauthorized `ARCHIVED` policies as product requires.

**Reasoning:** Prescriptions are sensitive clinical documents; CDN links without auth become durable PHI leaks.

### 20.10 File upload security

- Allow uploads only for authenticated privileged roles (or server-side PDF generation).
- Restrict MIME types, max size, and target folders.
- Store binaries in Cloudinary/object storage; persist only URLs/publicIds in MongoDB.

**Reasoning:** Unrestricted uploads enable malware hosting and storage abuse; DB binaries bloat and bypass CDN controls.

### 20.11 Audit logging

- Log authentication failures, role denials, appointment cancel/confirm, Rx issue/amend/void, and PDF downloads with `requestId`, actor, and entity ids.
- Prefer append-only `audit_logs` for clinical events as the product matures.
- Redact unnecessary PII in operational logs.

**Reasoning:** Clinics need accountability for “who changed what”; audits support dispute resolution and compliance.

### 20.12 Sensitive medical data protection

- Encrypt in transit (TLS) and at rest (Atlas encryption).
- Minimize PHI in URLs, client analytics, and error toasts.
- Scope queries strictly by patient ownership.
- Soft-delete / retention policies instead of casual hard deletes of clinical history.
- Limit production data access and avoid shipping real PHI to non-production environments.

**Reasoning:** Appointment notes, allergies, and prescriptions are PHI/sensitive personal data; least privilege and minimization reduce blast radius.

---

## 21. Performance Targets

Non-functional goals for v1 production quality. Measure on representative mobile networks for patient flows and broadband for admin.

| Surface | Target | Why it matters |
|---------|--------|----------------|
| Public homepage | **&lt; 2s** LCP-oriented load | First impression and SEO; bounce rate rises sharply after ~2s on mobile |
| Admin / patient dashboard shell | **&lt; 3s** interactive | Staff and patients need operable queues without waiting on full data chrome |
| Booking Server Action | **&lt; 1s** p95 success path | Booking feels “instant”; slow confirms invite double-submits and abandoned slots |
| API / Route Handler (webhooks, signed URL) | **&lt; 500ms** average | Keeps Clerk webhooks reliable and downloads snappy |
| Database queries (primary keyed lookups) | **&lt; 50–100ms** typical | Leaves headroom for transactions and rendering budget |
| Booking transaction (multi-doc) | **&lt; 300ms** DB portion when healthy | Protects the &lt;1s action budget under contention |
| Core Web Vitals (public) | **LCP &lt; 2.5s**, **INP &lt; 200ms**, **CLS &lt; 0.1** | Google CWV thresholds; correlates with perceived quality |
| Caching expectations | CMS/public doctor pages: tag/time revalidate; **slots/booking: no stale CDN cache** | Marketing can be cached; availability cannot |

### 21.1 Operational notes

- Prefer Server Components and lean payloads on mobile patient pages.
- Index-backed queries only for hot paths (see database architecture).
- Avoid waterfalls: parallelize independent reads in RSC where safe.
- Treat regressions against these budgets as release blockers for booking-critical paths.

---

## 22. Naming Conventions

Consistency reduces review friction, enables safe search/replace, and keeps feature boundaries obvious.

| Area | Convention | Examples |
|------|------------|----------|
| Folders | `kebab-case` for app routes; feature folders match domain nouns | `features/appointments/`, `app/(patient)/appointments/` |
| Files | `kebab-case` for route files; descriptive action files | `book-appointment.ts`, `page.tsx` |
| Components | `PascalCase` | `AppointmentList`, `SlotCalendar` |
| Hooks | `use` + `PascalCase` | `useMediaQuery`, `useBookingForm` |
| Models (TS export) | `PascalCase` singular | `Appointment`, `Prescription` |
| Collections (Mongo) | `lower_snake` **plural** | `appointments`, `clinic_contents` |
| Server Actions | verb + noun, camelCase export | `bookAppointment`, `confirmAppointment` |
| Constants | `SCREAMING_SNAKE` or namespaced objects | `APP_NAME`, `ROUTES.ADMIN` |
| Enums | `PascalCase` name; `SCREAMING_SNAKE` members | `AppointmentStatus.CONFIRMED` |
| Interfaces / Types | `PascalCase`; props suffix `Props`; results `ActionResult` | `BookAppointmentInput` |
| Environment variables | `SCREAMING_SNAKE`; `NEXT_PUBLIC_` only if client-safe | `MONGODB_URI`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Database fields | `camelCase` in Mongoose/TS documents | `patientId`, `startsAt`, `pdfUrl` |
| Routes | `kebab-case` URL segments | `/admin/prescriptions`, `/sign-in` |

### 22.1 Why consistency matters

- Predictable paths shorten onboarding and code review.
- Prevents duplicate concepts (`Booking` vs `Appointment`) across layers.
- Enables lint/Codemod refactors and safer grepping for authz checks.
- Aligns UI, API actions, and Mongo collections when debugging production incidents.

---

## 23. Testing Strategy

### 23.1 Roadmap by test type

| Layer | Scope | Priority |
|-------|-------|----------|
| Unit | Zod schemas, status transitions, pure utils, service helpers with mocked models | Highest early |
| Integration | Server Actions / services against test MongoDB; booking transaction races | High before booking launch |
| End-to-End | Playwright/Cypress critical journeys on preview deploys | High for release gates |
| Manual QA | Clinic scripts on staging (confirm, no-show, void Rx, mobile booking) | Required each release |
| Regression | Re-run booking + Rx packs after schema/status changes | Ongoing |
| CI/CD (future) | PR: lint + unit + integration; main: E2E smoke; blocked merge on red | Harden as team grows |

### 23.2 What to test by domain

**Appointments**
- Book happy path: slot `AVAILABLE` → `BOOKED`, appointment `PENDING`
- Confirm: `PENDING` → `CONFIRMED` (admin only)
- Cancel / no-show side effects on slots
- Patient can list only own history; admin can list all
- Double-book race: only one winner under concurrency

**Slots**
- Create windows; reject overlaps for same doctor
- `BLOCKED` / `HOLIDAY` not bookable
- Availability update authz (admin vs doctor self)

**Prescriptions**
- Draft not downloadable by patient
- Issue requires medications + diagnosis
- Amend/void transition rules
- Download authz + signed URL behavior

**Authentication**
- Unauthenticated users redirected from patient/admin trees
- Webhook signature failure rejected
- Inactive Mongo user blocked

**Authorization**
- Patient cannot confirm appointments or issue Rx
- Patient cannot download another patient’s PDF
- Admin-only CMS and doctor management actions

### 23.3 Design decision

**Automate invariants around Appointment as the hub first** (booking transaction + status machine), then widen to Rx and CMS. Manual QA remains mandatory for clinical judgment paths (void reasons, holiday calendars) until E2E coverage is mature.

---

## Out of scope for this document

- Application source code / Mongoose schema files
- Infrastructure-as-code (Terraform, etc.)
- Pixel-level UI design system beyond mobile-first principle
- Legal/compliance certification evidence

---

*End of system architecture. No application code generated.*
