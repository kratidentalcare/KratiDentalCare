# 04 — Database Design Addendum

**Status:** Additive improvement to the approved database design  
**Supplements:** [database-architecture.md](./database-architecture.md)  
**Scope:** New sections only — does not regenerate or replace prior collection specs except where `clinic_contents` strategy is superseded below.

---

## A. Identity vs Domain Clarification

This expands Design Principle #1 from the base document.

### A.1 Three distinct concepts

| Concept | Collection | What it is | What it is not |
|---------|------------|------------|----------------|
| **User** | `users` | Authentication **identity** bridged to Clerk (`clerkId`, role, session linkage) | Not a clinical profile; not schedule inventory |
| **Doctor** | `doctors` | **Business entity** — professional profile, specialties, booking eligibility | Not a login by itself |
| **Patient** | `patients` | **Business entity** — demographics, clinical contact data, care history anchor | Not a Clerk account by itself |

```
Clerk (Auth Provider)
        │
        │  identity only
        ▼
     users  ──────── role + optional refs ────┬──► doctors (business)
                                              │
                                              └──► patients (business)
```

### A.2 Rule: identity must not contain business data

`users` may store:

- `clerkId`, `email`, `role`, `isActive`
- optional `doctorId` / `patientId` **pointers**

`users` must **not** store:

- specialties, bio, consultation duration
- address, allergies, medical notes
- appointment history, prescriptions, slot calendars
- clinic marketing copy or booking rules

Those belong on `doctors`, `patients`, clinical collections, or settings/CMS collections.

### A.3 Why this supports future roles and scale

| Future need | How identity/domain split helps |
|-------------|----------------------------------|
| Receptionist | New `UserRole` on `users`; no need to invent a false “patient” or “doctor” row |
| Assistant | Same — identity + permissions; optional links later if needed |
| Multiple admins | Many `users` with `role=admin`; no clinic data duplicated per admin |
| Multiple clinics | Add `clinicId` to business collections; `users` gains membership/role per clinic without stuffing clinic PHI into Clerk |
| Doctor without portal | Create `doctors` first; attach `users` when invited |
| Walk-in patient | Create `patients` without `userId`; link identity later |

**Summary:** Authentication identity answers *who logged in*. Business entities answer *who treats / who is treated / what was booked*. Keeping them separate preserves flexibility as roles and tenancy grow.

---

## B. Base Schema Convention

All domain collections follow a shared baseline so models, repositories, and soft-delete behavior stay uniform.

### B.1 Common fields

| Field | Type | Required | Applicability | Notes |
|-------|------|----------|---------------|-------|
| `_id` | ObjectId | ✓ | All collections | Mongo primary key |
| `createdAt` | Date | ✓ | All collections | Set on insert (timestamps) |
| `updatedAt` | Date | ✓ | All collections | Set on every write |
| `deletedAt` | Date \| null | | Soft-delete domains | `null` = not deleted; prefer over hard delete for clinical/master data |
| `isActive` | boolean | | Master/config entities | Operational enablement when soft-delete is too coarse |

**Where `isActive` typically applies:** `users`, `doctors`, `patients`, CMS list entities (`services`, `testimonials`, `faqs`), and similar master data.

**Where `deletedAt` typically applies:** `patients`, `doctors`, `appointments` (or status-driven close), `prescriptions` (or status-driven void/archive), CMS rows — never as a substitute for clinical `VOID`/`CANCELLED` when a status machine exists; use both only with clear rules (status = business state; `deletedAt` = record hidden from default admin lists).

### B.2 Implementation convention (when coding)

- Shared TypeScript type / Mongoose plugin: `BaseDocument` + `timestamps: true`
- Queries default to `{ deletedAt: null }` (and `isActive: true` where relevant)
- Do not rely on clients to send `createdAt` / `updatedAt`

### B.3 Why a shared base schema improves maintainability

- One soft-delete / audit-timestamp pattern across features
- Less duplicated schema boilerplate and fewer inconsistent field names (`created_at` vs `createdAt`)
- Safer admin “restore” and retention jobs
- Easier onboarding — every collection “looks familiar”

---

## C. Centralized Status Enums (Database Contract)

Application and persistence must share one enum vocabulary (align with system architecture §18). Store these values consistently in MongoDB string fields.

### C.1 `UserRole`

| Value | Meaning |
|-------|---------|
| `admin` | Full clinic operations and CMS |
| `doctor` | Clinical actor linked to `doctors` |
| `patient` | Portal actor linked to `patients` |
| `receptionist` | **Reserved (future)** — front-desk ops without full admin |
| `assistant` | **Reserved (future)** — limited clinical/admin assist |

### C.2 `AppointmentStatus`

| Value | Meaning |
|-------|---------|
| `PENDING` | Booked; awaits confirmation |
| `CONFIRMED` | Accepted on schedule |
| `COMPLETED` | Visit finished |
| `CANCELLED` | Cancelled before completion |
| `NO_SHOW` | Patient did not attend |

### C.3 `SlotStatus`

| Value | Meaning |
|-------|---------|
| `AVAILABLE` | Open for booking |
| `BOOKED` | Reserved by an appointment |
| `BLOCKED` | Manually closed |
| `HOLIDAY` | Closed due to holiday calendar (may also be enforced via `holidays`) |

### C.4 `PrescriptionStatus`

| Value | Meaning |
|-------|---------|
| `DRAFT` | Not patient-visible |
| `ISSUED` | Finalized |
| `AMENDED` | Superseding correction |
| `VOID` | Invalidated |
| `ARCHIVED` | Retained; out of active queues |

### C.5 `DoctorStatus`

| Value | Meaning |
|-------|---------|
| `ACTIVE` | Operable |
| `INACTIVE` | Soft-disabled |
| `ON_LEAVE` | Temporarily not accepting new appointments |

### C.6 `PatientStatus`

| Value | Meaning |
|-------|---------|
| `ACTIVE` | Can book / use portal per product rules |
| `INACTIVE` | Disabled |
| `ARCHIVED` | Historical retention |

### C.7 `ContentStatus`

| Value | Meaning |
|-------|---------|
| `DRAFT` | Not public |
| `PUBLISHED` | Live |
| `ARCHIVED` | Retired from public view |

### C.8 Why enums stay centralized

- Prevents drift (`scheduled` vs `PENDING`) between DB docs, Zod, and UI
- Enables exhaustive TypeScript handling
- Makes analytics and audit logs comparable over time
- Single change point when product adds a status

**Location (implementation):** `constants/` or `validators/` enum modules — imported by Mongoose schemas and services. Do not redefine per feature.

---

## D. Website CMS Strategy — Replacing `clinic_contents`

### D.1 Options compared

#### Option A — Single `clinic_contents` (current base doc)

Keyed documents (`home.hero`, `about`, …) with flexible `body` / `blocks`.

| Pros | Cons |
|------|------|
| Few collections; fast to start | Heterogeneous content forced into one shape |
| Flexible keys | Weak querying (“all services ordered by `displayOrder`”) |
| Good for arbitrary pages | Admin UX becomes a generic key editor |
| | Harder validation per content type |
| | Indexes and unique constraints are coarse |

#### Option B — Modular CMS collections

Separate collections: `services`, `testimonials`, `faqs`, plus `website_settings` (and operational `clinic_settings` in §E).

| Pros | Cons |
|------|------|
| Typed fields per entity | More collections to migrate/manage |
| Natural admin CRUD & ordering | Slightly more join/orchestration for a homepage assemble |
| Clear publish/archive per item | |
| Better indexes (`slug`, `displayOrder`, `status`) | |
| Maps cleanly to feature modules | |

### D.2 Recommendation

**Adopt the modular approach for this project.** A dental clinic site is item-centric (services list, FAQ list, testimonials carousel) plus a small settings surface — not a free-form page CMS.

**Supersede `clinic_contents`:** treat it as deprecated in favor of:

| Collection | Purpose |
|------------|---------|
| `clinic_settings` | Operational clinic identity & booking rules (see §E) |
| `website_settings` | Public site presentation / SEO / hero copy |
| `services` | Treatable services offered by the clinic |
| `testimonials` | Patient/social proof entries |
| `faqs` | FAQ entries |

Do **not** implement `clinic_contents` in V1 code. Keep the base doc’s §3.7 for historical reference only; this addendum is authoritative for website data.

### D.3 Modular CMS collection specs

#### D.3.1 `website_settings`

**Purpose:** Singleton-ish public marketing settings (hero, SEO, theme hooks). Prefer **one document** for v1 (`key: "default"`) rather than many keyed blobs.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `key` | string | ✓ | | Unique; v1 value `default` |
| `heroTitle` | string | | ✓ | |
| `heroSubtitle` | string | | ✓ | |
| `aboutHtml` | string | | ✓ | Or markdown |
| `seoTitle` | string | | ✓ | |
| `seoDescription` | string | | ✓ | |
| `ogImageUrl` | string \| null | | ✓ | |
| `status` | ContentStatus | ✓ | | |
| `updatedByUserId` | ObjectId | ✓ | | Ref → `users` |
| `createdAt` / `updatedAt` | Date | ✓ | | Base schema |
| `deletedAt` | Date \| null | | ✓ | |

**Index:** unique `{ key: 1 }`

#### D.3.2 `services`

**Purpose:** Public list of dental services.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `name` | string | ✓ | | |
| `slug` | string | ✓ | | Unique |
| `summary` | string | ✓ | | Short card text |
| `description` | string | | ✓ | Long form |
| `icon` | string \| null | | ✓ | Icon key or URL |
| `displayOrder` | number | ✓ | | |
| `status` | ContentStatus | ✓ | | |
| `isActive` | boolean | ✓ | | |
| `updatedByUserId` | ObjectId | ✓ | | |
| `createdAt` / `updatedAt` | Date | ✓ | | |
| `deletedAt` | Date \| null | | ✓ | |

**Indexes:** unique `{ slug: 1 }`; `{ status: 1, displayOrder: 1 }`

#### D.3.3 `testimonials`

**Purpose:** Social proof entries for the public site.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `authorName` | string | ✓ | | |
| `quote` | string | ✓ | | |
| `rating` | number | | ✓ | 1–5 if used |
| `displayOrder` | number | ✓ | | |
| `status` | ContentStatus | ✓ | | |
| `isActive` | boolean | ✓ | | |
| `updatedByUserId` | ObjectId | ✓ | | |
| `createdAt` / `updatedAt` | Date | ✓ | | |
| `deletedAt` | Date \| null | | ✓ | |

**Index:** `{ status: 1, displayOrder: 1 }`

#### D.3.4 `faqs`

**Purpose:** FAQ items for public help / SEO.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `question` | string | ✓ | | |
| `answer` | string | ✓ | | |
| `category` | string | | ✓ | e.g. `booking`, `treatment` |
| `displayOrder` | number | ✓ | | |
| `status` | ContentStatus | ✓ | | |
| `isActive` | boolean | ✓ | | |
| `updatedByUserId` | ObjectId | ✓ | | |
| `createdAt` / `updatedAt` | Date | ✓ | | |
| `deletedAt` | Date \| null | | ✓ | |

**Index:** `{ status: 1, category: 1, displayOrder: 1 }`

---

## E. `clinic_settings` Collection

### E.1 Purpose

**Operational singleton** for clinic identity, contact, hours, timezone, and booking policy. Distinct from marketing CMS (`website_settings` / `services` / …).

Why it should exist:

- Booking, reminders, and PDFs need canonical clinic name, timezone, and rules — not hero copy
- Admins change hours/phone without touching SEO or FAQ rows
- Future multi-clinic: one settings doc per `clinicId`
- Avoids overloading `doctors` or `users` with clinic-wide config

### E.2 Fields

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `clinicName` | string | ✓ | | Legal/display name |
| `address` | object | ✓ | | Embedded address (same shape as patient address) |
| `phone` | string | ✓ | | Primary clinic phone |
| `email` | string | ✓ | | Primary clinic email |
| `logoUrl` | string \| null | | ✓ | Cloudinary later |
| `openingHours` | string \| object | ✓ | | Prefer structured weekly map in implementation |
| `closingHours` | string \| object | | ✓ | If not folded into weekly `openingHours` |
| `timezone` | string | ✓ | | IANA tz, e.g. `Asia/Kolkata` |
| `bookingRules` | object | ✓ | | Embedded rules (below) |
| `socialLinks` | object | | ✓ | `{ instagram?, facebook?, youtube?, … }` |
| `emergencyContact` | object | | ✓ | `{ name?, phone }` for public/emergency display |
| `isActive` | boolean | ✓ | | |
| `createdAt` / `updatedAt` | Date | ✓ | | |
| `deletedAt` | Date \| null | | ✓ | Rare for singleton |

**Embedded `bookingRules` (recommended)**

| Field | Type | Notes |
|-------|------|-------|
| `minLeadTimeHours` | number | Earliest bookable offset |
| `maxAdvanceDays` | number | How far ahead patients may book |
| `cancellationCutoffHours` | number | Patient self-cancel window |
| `defaultSlotMinutes` | number | Fallback duration |
| `allowSameDayBooking` | boolean | |

### E.3 Relationships & indexes

- No required refs to clinical collections
- Optional `updatedByUserId` → `users` (recommended for auditability)
- Unique singleton guard: `{ clinicKey: 1 }` with `clinicKey: "primary"` in v1, **or** enforce single document in service layer

### E.4 Validation recommendations

- `timezone` must be a valid IANA identifier
- `email` / `phone` normalized
- `bookingRules` numeric fields ≥ 0

---

## F. `holidays` Collection

### F.1 Purpose

Canonical calendar of clinic (or doctor-scoped, future) non-working dates. Used for planning and **slot generation**, not only as one-off `BLOCKED` slots.

### F.2 Fields

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `date` | Date | ✓ | | Store as UTC midnight of clinic-local date **or** `YYYY-MM-DD` string — pick one convention and stick to it |
| `reason` | string | ✓ | | e.g. `Diwali`, `Clinic renovation` |
| `isRecurring` | boolean | ✓ | | If true, applies every year on month/day |
| `createdBy` | ObjectId | ✓ | | Ref → `users` |
| `createdAt` / `updatedAt` | Date | ✓ | | |
| `deletedAt` | Date \| null | | ✓ | Soft remove holiday rule |
| `isActive` | boolean | ✓ | | |

**Optional future fields (not required v1):** `doctorId` (doctor-specific leave), `clinicId`.

### F.3 Indexes

- Unique: `{ date: 1 }` for non-recurring clinic-wide holidays (adjust if doctor-scoped later)
- `{ isRecurring: 1, isActive: 1 }`
- `{ date: 1, isActive: 1 }`

### F.4 Why holidays are separate from blocked slots

| Approach | Limitation |
|----------|------------|
| Only `slots` with `BLOCKED` / `HOLIDAY` | Must materialize every window; easy to miss gaps; hard to express “closed all day, every year” |
| `holidays` collection | Single rule covers the day; generation/booking consults calendar first |

Benefits:

- Admin marks **one date** instead of N slot rows
- Recurring annual holidays without re-blocking every year
- Slot generator skips holiday dates before creating `AVAILABLE` inventory
- Booking path can reject same-day attempts if generator lagged (defense in depth)
- Reporting (“clinic closed days”) stays trivial

### F.5 Interaction with future slot generation

```
schedule_rules (future) + clinic_settings.timezone
        │
        ▼
For each candidate day in range
        │
        ├── holidays says closed? ──yes──► skip day (no AVAILABLE slots)
        │
        └── no ──► materialize slots as AVAILABLE
                     (unless doctor ON_LEAVE / not accepting)
```

Runtime booking should still treat existing `SlotStatus.HOLIDAY` / `BLOCKED` as non-bookable even if a holiday row was added after slots were generated (consistency repair job can align them later).

---

## G. Future Collection — `audit_logs` (Not V1)

**Status:** Documented for roadmap only — **do not implement in V1.**

### G.1 Purpose

Append-only trail of who changed what in clinically sensitive workflows.

### G.2 Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | ✓ | |
| `action` | string | ✓ | e.g. `appointment.confirm`, `prescription.void` |
| `entity` | string | ✓ | Collection/entity name: `appointment`, `prescription`, … |
| `entityId` | ObjectId | ✓ | Target document id |
| `oldValue` | object \| null | | Redacted/partial snapshot before change |
| `newValue` | object \| null | | Redacted/partial snapshot after change |
| `performedBy` | ObjectId | ✓ | Ref → `users` |
| `timestamp` | Date | ✓ | Event time (usually = `createdAt`) |
| `createdAt` | Date | ✓ | Base schema alignment |
| `requestId` | string | | Optional correlation id |

No `deletedAt` updates in normal operation — **insert only**.

### G.3 Indexes (when implemented)

- `{ entity: 1, entityId: 1, timestamp: -1 }`
- `{ performedBy: 1, timestamp: -1 }`
- `{ action: 1, timestamp: -1 }`

### G.4 Why healthcare software benefits from audit logs

- Accountability for cancellations, voids, amplifications of Rx, and access to downloads
- Dispute resolution (“who confirmed / who voided”)
- Supports compliance programs and internal QA
- Decouples forensic history from mutable operational documents

### G.5 V1 stance

Rely on application logs for incidents. Promote high-risk events into `audit_logs` when prescriptions, multi-admin access, or regulatory needs demand it.

---

## H. Updated Collection Map (Authoritative for Website + Ops)

Clinical collections from the base document remain unchanged in name and purpose: `users`, `doctors`, `patients`, `slots`, `appointments`, `prescriptions`.

| Collection | V1? | Purpose |
|------------|-----|---------|
| `clinic_settings` | ✓ | Ops identity, hours, timezone, booking rules |
| `website_settings` | ✓ | Public marketing/SEO settings |
| `services` | ✓ | Service catalog CMS |
| `testimonials` | ✓ | Testimonials CMS |
| `faqs` | ✓ | FAQ CMS |
| `holidays` | ✓ | Closed dates / recurring holidays |
| `clinic_contents` | ✗ deprecated | Superseded by modular CMS + settings |
| `audit_logs` | ✗ future | Compliance trail |

### H.1 Capability map additions

| Capability | Collections |
|------------|-------------|
| Clinic phone / hours / booking policy | `clinic_settings` |
| Public homepage assemble | `website_settings` + `services` + `testimonials` + `faqs` |
| Close clinic on a date | `holidays` (+ slot generation / `HOLIDAY` slots) |
| Compliance history (later) | `audit_logs` |

### H.2 Implementation order adjustment

When coding starts, prefer:

1. `users` + Clerk sync  
2. `doctors`, `patients`  
3. `clinic_settings`, `holidays`  
4. `slots` + `appointments`  
5. `prescriptions`  
6. `website_settings`, `services`, `testimonials`, `faqs`  
7. (`audit_logs` — post-V1)

---

## I. Relationship sketch (additions only)

```
users
  │
  ├── updatedByUserId ──► clinic_settings
  ├── updatedByUserId ──► website_settings / services / testimonials / faqs
  └── createdBy ────────► holidays

holidays ──(consulted by)──► slot generation ──► slots
clinic_settings.bookingRules ──(constraints)──► booking service
```

Clinical ER from the base document is unchanged: Appointment remains the hub among Patient, Doctor, Slot, and Prescription.

---

*End of database design addendum. No Mongoose models generated.*
