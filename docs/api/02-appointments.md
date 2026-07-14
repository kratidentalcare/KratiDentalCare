# 02 — Appointments API

**Project:** Krati Dental Care — Dental Clinic Management System  
**Status:** Designed (API documentation)  
**Related:** [00-api-guidelines.md](./00-api-guidelines.md) · [01-authentication.md](./01-authentication.md) · [../03-system-architecture.md](../03-system-architecture.md) · [../04-database-design.md](../04-database-design.md)

**Implementation note:** V1 mutations/queries are primarily **Server Actions** mapped 1:1 to these resource operations. Path shapes below are the canonical HTTP identity for Route Handlers / future public APIs. Envelope, error codes, pagination, and authz rules follow [00-api-guidelines.md](./00-api-guidelines.md).

**Routing note:** Static paths (`/history`, `/upcoming`, `/today`, `/calendar`) must be registered **before** `/appointments/{id}` so they are not captured as ids.

---

# Overview

## Purpose

The Appointment API is the **core clinical operations surface** of the clinic system. It models the visit aggregation root: booking invent ory (slots) to a patient–doctor visit, driving confirmation, day-of clinic flow, completion, and downstream prescription issuance.

## Scope

**In scope**

- List, get, book, update metadata, confirm, check-in, complete, cancel, reschedule
- Patient, admin, and future doctor authorization matrices
- Filtering, sorting, search, pagination, and calendar views
- Atomic coordination with `slots` (double-booking prevention)
- Status machine and conflict/error contracts

**Out of scope**

- Slot inventory CRUD (see `03-slots.md`)
- Prescription issue/download (see `06-prescriptions.md`)
- Payments / reminders (future)
- Implementation source code

## Related Collections

| Collection | Role |
|------------|------|
| `appointments` | Visit records (primary) |
| `slots` | Bookable inventory; status flips with book/cancel/reschedule |
| `patients` | Ownership and snapshots |
| `doctors` | Schedule filter and snapshots |
| `users` | Actor identity (`bookedByUserId`, cancel actor, role) |
| `prescriptions` | Downstream of `COMPLETED` (referenced, not mutated here) |
| `clinic_settings` | Booking rules (lead time, cancel cutoff, same-day) |
| `holidays` | Closed-day defense-in-depth at book/reschedule |

## Dependencies

| Dependency | Why |
|------------|-----|
| Clerk session + Mongo `users` | Authn / RBAC ([01-authentication.md](./01-authentication.md)) |
| `requireAppUser`, `requireRole`, `requirePatientAccess` | Authz helpers |
| Slot service / indexes | Unique `(doctorId, startAt)`, unique `appointments.slotId` |
| Mongo transactions | Multi-document book / cancel / reschedule |
| Zod validators | `validators/appointments.ts` (+ shared ObjectId, pagination) |
| Centralized `AppointmentStatus` / `SlotStatus` | Enum contract |

---

# Appointment Lifecycle

Product lifecycle (appointment-centric):

```
Available Slot
      ↓  POST /appointments
Appointment Requested (PENDING)
      ↓  PATCH .../confirm
Confirmed (CONFIRMED)
      ↓  PATCH .../check-in
Checked In (CHECKED_IN)
      ↓  PATCH .../complete
Completed (COMPLETED)
      ↓  (Prescription module — issue Rx)
Prescription Issued
      ↓  (retention / ops policy)
Archived (ARCHIVED)
```

### Status vocabulary (API contract)

| Status | Meaning |
|--------|---------|
| `PENDING` | Booked against a slot; awaiting clinic confirmation (“Appointment Requested”) |
| `CONFIRMED` | Accepted on the schedule; patient expected |
| `CHECKED_IN` | Patient arrived / clinic marked present |
| `COMPLETED` | Visit finished |
| `CANCELLED` | Voided before completion |
| `NO_SHOW` | Confirmed (or late-window) visit missed — alternate terminal for day-of (admin/doctor) |
| `ARCHIVED` | Retained for history; out of active ops queues |

> **Alignment note:** System architecture §18 lists `PENDING` / `CONFIRMED` / `COMPLETED` / `CANCELLED` / `NO_SHOW`. This API **adds** `CHECKED_IN` and `ARCHIVED` for day-of flow and retention. Shared enums must be updated when implementing.

### Slot status coupling

| Appointment event | Slot effect |
|-------------------|-------------|
| Book (`PENDING`) | `AVAILABLE` → `BOOKED` (+ `appointmentId`) |
| Cancel (future slot, policy allow) | Prefer `BOOKED` → `AVAILABLE` (clear `appointmentId`) |
| Cancel (past / consumed) | Slot remains non-bookable per product rule |
| Reschedule | Old slot released (per cancel policy); new slot `AVAILABLE` → `BOOKED` |
| Complete / check-in / no-show | Slot stays historically `BOOKED` (consumed) |

### State transition matrix

| From | Event | To | Allowed actors |
|------|-------|----|----------------|
| *(slot AVAILABLE)* | Book | `PENDING` | `patient` (self), `admin` (on behalf) |
| `PENDING` | Confirm | `CONFIRMED` | `admin` (future: `doctor` for own list) |
| `PENDING` | Cancel | `CANCELLED` | Owning `patient` (within cutoff) or `admin` |
| `CONFIRMED` | Check-in | `CHECKED_IN` | `admin` (future: `doctor`) |
| `CONFIRMED` | Cancel | `CANCELLED` | Owning `patient` (within cutoff) or `admin` |
| `CONFIRMED` | No-show | `NO_SHOW` | `admin` (future: `doctor`) — via admin ops; may share cancel tooling or dedicated endpoint later |
| `CHECKED_IN` | Complete | `COMPLETED` | `admin` (future: `doctor`) |
| `CHECKED_IN` | Cancel | ✗ (prefer complete or admin override rare) | Default: **forbidden** |
| `COMPLETED` | Archive | `ARCHIVED` | System / admin retention job (not a primary UI action in v1) |
| `COMPLETED` / `CANCELLED` / `NO_SHOW` / `ARCHIVED` | Reschedule | ✗ | — |
| `PENDING` / `CONFIRMED` | Reschedule | Same appointment, new slot; status remains `PENDING` (reconfirm) **or** stays `CONFIRMED` if admin force — **v1 rule:** reschedule → **`PENDING`** again |
| Any | Confirm when not `PENDING` | ✗ | — |
| Any | Complete before `CHECKED_IN` | ✗ | — |

### Transition explanations

1. **Available Slot → PENDING** — Patient/admin books an `AVAILABLE` slot in a transaction; snapshots times + patient/doctor; unique `slotId` prevents double book.
2. **PENDING → CONFIRMED** — Clinic accepts the visit; patient appears on the day schedule as expected.
3. **CONFIRMED → CHECKED_IN** — Front desk / clinical staff marks arrival; unlocks completion.
4. **CHECKED_IN → COMPLETED** — Visit closed; enables prescription issuance in the Rx module.
5. **COMPLETED → Prescription Issued** — Not an appointment status change; Rx `ISSUED` links via `appointmentId` (see prescriptions API).
6. **COMPLETED → ARCHIVED** — Soft operational retirement for long-term history / reporting queues.
7. **Cancel paths** — From `PENDING` or `CONFIRMED` only (v1); releases slot when policy allows.
8. **Reschedule** — Atomic swap of `slotId` + time snapshots; old slot freed; new slot booked; forces reconfirmation (`PENDING`) unless product later allows admin “keep confirmed.”

---

# Cross-Cutting API Conventions

## Authentication

All appointment endpoints require a valid Clerk session **and** an active Mongo `users` row (`requireAppUser`). Public/anonymous access is **not** allowed.

## Authorization summary

| Actor | Capabilities |
|-------|----------------|
| **Patient** | List/get **own** appointments; book for self; cancel own (cutoff); reschedule own (cutoff); read history/upcoming scoped to self. **Cannot** confirm, check-in, complete, or book for others. |
| **Admin** | Full clinic list/filters; book on behalf of any patient; confirm, check-in, complete, cancel, reschedule; today/calendar clinic views. |
| **Doctor (future)** | Read/manage **own** `doctorId` schedule; confirm/check-in/complete for own appointments; cannot manage other doctors’ queues or CMS. |

Ownership: patients limited to `users.patientId`. Cross-patient probing returns **`404 NOT_FOUND`** (not `403`) when appropriate to reduce PHI leakage.

## Filtering / sorting / search / pagination

Applies to list-style endpoints (`GET /appointments`, and specialized views where noted).

### Query parameters (shared list contract)

| Param | Type | Default | Rules |
|-------|------|---------|-------|
| `page` | integer ≥ 1 | `1` | 1-based |
| `limit` | integer | `20` | Max **100**; clamp server-side |
| `sort` | string | `startsAt:asc` or resource default | Allowlist only |
| `search` | string | — | Trimmed; allowlisted fields (patient name/phone via snapshot, reason) — **admin**; patients: limited to own `reason` only |
| `status` | enum or csv | — | `AppointmentStatus` allowlist |
| `doctorId` | ObjectId | — | Admin/doctor; patients ignored/forbidden |
| `patientId` | ObjectId | — | Admin only (patients forced to self) |
| `from` | ISO-8601 | — | `startsAt >= from` |
| `to` | ISO-8601 | — | `startsAt < to` (half-open recommended) |
| `q` | alias | — | Prefer single `search` param in v1 |

### Allowed sort fields

`startsAt:asc` | `startsAt:desc` | `createdAt:desc` | `updatedAt:desc` | `status:asc`

Reject unknown sort paths with `400 VALIDATION_ERROR`.

### Pagination meta

```json
{
  "page": 1,
  "limit": 20,
  "total": 135,
  "totalPages": 7
}
```

## Common response shapes

**Appointment resource (`data` item):**

```json
{
  "id": "665f1c2a9a1b2c3d4e5f6789",
  "patientId": "665f1c2a9a1b2c3d4e5f6790",
  "doctorId": "665f1c2a9a1b2c3d4e5f6791",
  "slotId": "665f1c2a9a1b2c3d4e5f6792",
  "status": "PENDING",
  "reason": "Tooth pain",
  "notes": null,
  "startsAt": "2026-07-20T04:30:00.000Z",
  "endsAt": "2026-07-20T05:00:00.000Z",
  "patientSnapshot": {
    "fullName": "Asha Verma",
    "phone": "+9198XXXXXXXX",
    "email": "asha@example.com"
  },
  "doctorSnapshot": {
    "fullName": "Dr. Krati",
    "specialties": ["General Dentistry"]
  },
  "cancellationReason": null,
  "cancelledAt": null,
  "bookedByUserId": "665f1c2a9a1b2c3d4e5f6793",
  "createdAt": "2026-07-15T10:00:00.000Z",
  "updatedAt": "2026-07-15T10:00:00.000Z"
}
```

## Shared business rules (all mutations)

1. Cannot book an unavailable / past / holiday-blocked slot.
2. Cannot confirm a cancelled (or non-`PENDING`) appointment.
3. Cannot complete an appointment before check-in (`CHECKED_IN` required).
4. Cannot reschedule `COMPLETED`, `CANCELLED`, `NO_SHOW`, or `ARCHIVED` appointments.
5. Slot availability must be validated **atomically** (transaction + conditional update `status: AVAILABLE`).
6. Appointment creation must prevent double booking (unique `slotId`; abort if slot update `matchedCount = 0`).
7. Clients must not send privilege or illegal status fields (`status` only via workflow endpoints).
8. Respect `clinic_settings.bookingRules` (lead time, max advance, cancellation cutoff, same-day flag).
9. Inactive patient/doctor → reject booking with domain error.
10. Every mutation re-checks authz; UI hiding is not security.

## Shared error catalog (appointment domain)

| `error.code` | HTTP | Meaning |
|--------------|------|---------|
| `UNAUTHORIZED` | 401 | No valid session / app user |
| `FORBIDDEN` | 403 | Role insufficient |
| `NOT_FOUND` | 404 | Appointment missing or hidden by ownership |
| `VALIDATION_ERROR` | 400 | Zod / query failures |
| `SLOT_NOT_AVAILABLE` | 409 | Slot not `AVAILABLE` or race lost |
| `DOUBLE_BOOKING` | 409 | Unique constraint / concurrent book |
| `INVALID_STATUS_TRANSITION` | 422 | Illegal lifecycle move |
| `INVALID_DOCTOR` | 422 | Doctor missing/inactive/not accepting |
| `INVALID_PATIENT` | 422 | Patient missing/inactive |
| `APPOINTMENT_NOT_RESCHEDULABLE` | 422 | Terminal or disallowed status |
| `CANCEL_WINDOW_EXPIRED` | 422 | Past patient cancel cutoff |
| `BOOKING_RULE_VIOLATION` | 422 | Lead time / advance / same-day rules |
| `CLINIC_CLOSED` | 422 | Holiday / closed calendar |
| `RATE_LIMITED` | 429 | Abuse protection |
| `INTERNAL_ERROR` | 500 | Unexpected |

---

# Endpoints

---

## 1. List appointments

### 1. Purpose

Paginated appointment list for ops and portal queues with filters.

### 2. Endpoint

`/appointments`

### 3. HTTP Method

`GET`

**Server Action:** `listAppointments`

### 4. Authentication

Required.

### 5. Authorization

| Role | Scope |
|------|--------|
| `patient` | Forced `patientId = self`; cannot filter other patients |
| `admin` | Full clinic; all filters |
| `doctor` (future) | Forced `doctorId = self` unless also admin |

### 6. Request Body

None.

### 7. Query Parameters

Shared list params: `page`, `limit`, `sort`, `search`, `status`, `doctorId`, `patientId`, `from`, `to`.

### 8. Path Parameters

None.

### 9. Validation Rules

- ObjectIds valid when provided
- `status` ∈ `AppointmentStatus` (single or allowlisted CSV)
- `from`/`to` valid ISO dates; if both, `from < to`
- `limit` ≤ 100

### 10. Business Rules

- Default exclude `ARCHIVED` unless `status=ARCHIVED` or `includeArchived=true` (optional flag; default false)
- Patient search cannot escape ownership scope
- Prefer indexed filters: `patientId+startsAt`, `doctorId+startsAt`, `status+startsAt`

### 11. Success Response

```json
{
  "success": true,
  "data": [ { "id": "…", "status": "PENDING", "startsAt": "…" } ],
  "meta": {
    "requestId": "req_01JEXAMPLE",
    "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
  }
}
```

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `500`

### 14. Related Collections

`appointments` (read)

### 15. Sequence Diagram

```
Client                Action/API              Auth                 MongoDB
  │  GET /appointments      │                   │                     │
  │────────────────────────►│ requireAppUser    │                     │
  │                         │──────────────────►│                     │
  │                         │ scope by role     │                     │
  │                         │ Zod query         │                     │
  │                         │ find + count ──────────────────────────►│
  │◄──── 200 list ──────────│◄────────────────────────────────────────│
```

### 16. Notes

- Use specialized endpoints (`/today`, `/upcoming`) for common dashboards to keep default list predictable.
- Never return other patients’ rows to a patient caller.

---

## 2. Get appointment by id

### 1. Purpose

Fetch a single appointment for detail views.

### 2. Endpoint

`/appointments/{id}`

### 3. HTTP Method

`GET`

**Server Action:** `getAppointment`

### 4. Authentication

Required.

### 5. Authorization

| Role | Rule |
|------|------|
| `patient` | Own `patientId` only → else `NOT_FOUND` |
| `admin` | Any |
| `doctor` (future) | Own `doctorId` only → else `NOT_FOUND` |

### 6. Request Body

None.

### 7. Query Parameters

None required. Optional `include=prescriptions` deferred to prescriptions API.

### 8. Path Parameters

| Param | Type | Rules |
|-------|------|-------|
| `id` | ObjectId | Required; invalid → `400` |

### 9. Validation Rules

Zod ObjectId for `id`.

### 10. Business Rules

- Soft-hidden deleted rows (if `deletedAt` used) → `NOT_FOUND`
- Do not leak existence across patients

### 11. Success Response

```json
{
  "success": true,
  "data": {
    "id": "665f1c2a9a1b2c3d4e5f6789",
    "status": "CONFIRMED",
    "slotId": "665f1c2a9a1b2c3d4e5f6792",
    "startsAt": "2026-07-20T04:30:00.000Z",
    "endsAt": "2026-07-20T05:00:00.000Z"
  },
  "meta": { "requestId": "req_01JEXAMPLE" }
}
```

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `404`, `500`

### 14. Related Collections

`appointments`

### 15. Sequence Diagram

```
Client          getAppointment         Auth              MongoDB
  │ GET /appointments/{id} │             │                  │
  │───────────────────────►│ requireAppUser                 │
  │                        │ findById ─────────────────────►│
  │                        │ ownership check                │
  │◄──── 200 | 404 ────────│                                │
```

### 16. Notes

Prefer `404` over `403` for cross-patient reads.

---

## 3. Book appointment (create)

### 1. Purpose

Create an appointment from an `AVAILABLE` slot; core booking path.

### 2. Endpoint

`/appointments`

### 3. HTTP Method

`POST`

**Server Action:** `bookAppointment`

### 4. Authentication

Required.

### 5. Authorization

| Role | Rule |
|------|------|
| `patient` | `patientId` must equal self (omit or must match) |
| `admin` | Must supply `patientId` |
| `doctor` (future) | Default **deny** book-on-behalf unless product allows |

### 6. Request Body

```json
{
  "slotId": "665f1c2a9a1b2c3d4e5f6792",
  "patientId": "665f1c2a9a1b2c3d4e5f6790",
  "reason": "Tooth pain"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `slotId` | ✓ | Target inventory |
| `patientId` | Admin ✓; patient optional/ignored → self | |
| `reason` | | Max length (e.g. 500) |

Do **not** accept: `status`, `doctorId` (derived from slot), `startsAt`/`endsAt` (snapshotted), snapshots, `notes` (admin may set via PATCH).

### 7. Query Parameters

None.

### 8. Path Parameters

None.

### 9. Validation Rules

- Valid ObjectIds
- `reason` length bounds
- Strip unknown keys

### 10. Business Rules

1. Load slot; must be `AVAILABLE`; `startAt` in the future per booking rules.
2. Doctor must be `ACTIVE` and accepting appointments.
3. Patient must be `ACTIVE`.
4. Consult holidays / `CLINIC_CLOSED`.
5. **Transaction:**
   - Insert appointment `PENDING` with snapshots + `bookedByUserId`
   - Conditional update slot `AVAILABLE` → `BOOKED` with `appointmentId`
   - If slot update matches 0 → abort → `SLOT_NOT_AVAILABLE` / `DOUBLE_BOOKING`
6. Unique index on `appointments.slotId` is the final safety net.

### 11. Success Response

```json
{
  "success": true,
  "data": {
    "id": "665f1c2a9a1b2c3d4e5f6789",
    "status": "PENDING",
    "slotId": "665f1c2a9a1b2c3d4e5f6792",
    "startsAt": "2026-07-20T04:30:00.000Z",
    "endsAt": "2026-07-20T05:00:00.000Z"
  },
  "meta": { "requestId": "req_01JEXAMPLE" }
}
```

**HTTP:** `201`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `SLOT_NOT_AVAILABLE`, `DOUBLE_BOOKING`, `INVALID_DOCTOR`, `INVALID_PATIENT`, `BOOKING_RULE_VIOLATION`, `CLINIC_CLOSED`, `RATE_LIMITED`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`201`, `400`, `401`, `403`, `409`, `422`, `429`, `500`

### 14. Related Collections

`appointments`, `slots`, `patients`, `doctors`, `users`, `clinic_settings`, `holidays`

### 15. Sequence Diagram — Book Appointment

```
Patient/Admin         API/Action           BookingService         MongoDB
     │  POST /appointments  │                     │                  │
     │─────────────────────►│ requireAppUser      │                  │
     │                      │ authz patient/admin │                  │
     │                      │ Zod                 │                  │
     │                      │────────────────────►│ begin txn        │
     │                      │                     │ load slot        │
     │                      │                     │ AVAILABLE?       │
     │                      │                     │ insert appt PENDING
     │                      │                     │ slot → BOOKED    │
     │                      │                     │ unique slotId    │
     │                      │                     │ commit / abort   │
     │                      │◄──── ok | conflict ─│                  │
     │◄── 201 | 409 ────────│ revalidate paths    │                  │
```

### 16. Notes

- Optional future `Idempotency-Key` for HTTP clients.
- Revalidate patient + admin appointment paths after success.
- Slot list reads must stay uncached / fresh near booking.

---

## 4. Update appointment (metadata)

### 1. Purpose

Partial update of non-lifecycle fields (reason/notes). **Not** for status or slot changes.

### 2. Endpoint

`/appointments/{id}`

### 3. HTTP Method

`PATCH`

**Server Action:** `updateAppointment`

### 4. Authentication

Required.

### 5. Authorization

| Role | Allowed fields |
|------|----------------|
| `patient` | Own appt; `reason` only; not when terminal |
| `admin` | `reason`, `notes` |
| `doctor` (future) | Own schedule; `notes` |

### 6. Request Body

```json
{
  "reason": "Sensitivity on upper left",
  "notes": "Prefers morning slots"
}
```

### 7. Query Parameters

None.

### 8. Path Parameters

| Param | Type |
|-------|------|
| `id` | ObjectId |

### 9. Validation Rules

- At least one allowlisted field
- Length caps; strip `status`, `slotId`, `patientId`, `doctorId`

### 10. Business Rules

- Reject updates when status ∈ `CANCELLED` | `NO_SHOW` | `ARCHIVED` (and optionally `COMPLETED` for patient `reason`)
- Status/slot changes must use workflow endpoints

### 11. Success Response

```json
{
  "success": true,
  "data": { "id": "…", "reason": "Sensitivity on upper left", "notes": "…" },
  "meta": { "requestId": "req_01JEXAMPLE" }
}
```

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INVALID_STATUS_TRANSITION` (if locked), `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `404`, `422`, `500`

### 14. Related Collections

`appointments`

### 15. Sequence Diagram

```
Client            updateAppointment        Auth           MongoDB
  │ PATCH /appointments/{id} │               │               │
  │─────────────────────────►│ require + ownership           │
  │                          │ Zod allowlist │               │
  │                          │ update fields ───────────────►│
  │◄──────── 200 ────────────│               │               │
```

### 16. Notes

Keep this endpoint thin; workflow verbs stay explicit.

---

## 5. Confirm appointment

### 1. Purpose

Clinic accepts a `PENDING` appointment onto the schedule.

### 2. Endpoint

`/appointments/{id}/confirm`

### 3. HTTP Method

`PATCH`

**Server Action:** `confirmAppointment`

### 4. Authentication

Required.

### 5. Authorization

| Role | Access |
|------|--------|
| `admin` | ✓ |
| `doctor` (future) | ✓ for own `doctorId` |
| `patient` | ✗ |

### 6. Request Body

Empty object or omitted.

```json
{}
```

### 7. Query Parameters

None.

### 8. Path Parameters

| Param | Type |
|-------|------|
| `id` | ObjectId |

### 9. Validation Rules

Valid `id` only.

### 10. Business Rules

- Current status must be `PENDING`
- If already `CONFIRMED` → **idempotent success** return current resource (`200`) per guidelines recommendation
- Cannot confirm `CANCELLED`, `COMPLETED`, etc. → `INVALID_STATUS_TRANSITION`
- Slot remains `BOOKED`

### 11. Success Response

```json
{
  "success": true,
  "data": { "id": "…", "status": "CONFIRMED" },
  "meta": { "requestId": "req_01JEXAMPLE" }
}
```

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INVALID_STATUS_TRANSITION`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `404`, `422`, `500`

### 14. Related Collections

`appointments`

### 15. Sequence Diagram — Confirm Appointment

```
Admin                 API/Action            ApptService           MongoDB
  │ PATCH .../confirm      │                     │                  │
  │───────────────────────►│ requireRole(admin)  │                  │
  │                        │────────────────────►│ load appt        │
  │                        │                     │ status PENDING?  │
  │                        │                     │ → CONFIRMED      │
  │                        │◄──── ok ────────────│                  │
  │◄── 200 ────────────────│ revalidate          │                  │
```

### 16. Notes

Reduces no-shows by making clinic acceptance explicit before day-of.

---

## 6. Check in appointment

### 1. Purpose

Mark patient arrival (`CONFIRMED` → `CHECKED_IN`).

### 2. Endpoint

`/appointments/{id}/check-in`

### 3. HTTP Method

`PATCH`

**Server Action:** `checkInAppointment`

### 4. Authentication

Required.

### 5. Authorization

| Role | Access |
|------|--------|
| `admin` | ✓ |
| `doctor` (future) | ✓ own schedule |
| `patient` | ✗ (unless future self check-in kiosk — not v1) |

### 6. Request Body

```json
{}
```

Optional later: `checkedInAt` override — **not** accepted from client in v1 (server sets timestamp).

### 7. Query Parameters

None.

### 8. Path Parameters

| Param | Type |
|-------|------|
| `id` | ObjectId |

### 9. Validation Rules

Valid `id`.

### 10. Business Rules

- Must be `CONFIRMED` → `CHECKED_IN`
- Already `CHECKED_IN` → idempotent `200`
- Cannot check in from `PENDING` (must confirm first) → `INVALID_STATUS_TRANSITION`
- Cannot check in `CANCELLED` / terminal states
- Enables `complete`

### 11. Success Response

```json
{
  "success": true,
  "data": { "id": "…", "status": "CHECKED_IN" },
  "meta": { "requestId": "req_01JEXAMPLE" }
}
```

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INVALID_STATUS_TRANSITION`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `404`, `422`, `500`

### 14. Related Collections

`appointments`

### 15. Sequence Diagram

```
Admin/Doctor        checkInAppointment      Service              MongoDB
  │ PATCH .../check-in │                      │                    │
  │───────────────────►│ requireRole          │                    │
  │                    │─────────────────────►│ CONFIRMED→CHECKED_IN
  │◄──── 200 ──────────│◄─────────────────────│                    │
```

### 16. Notes

Gate completion on check-in to keep analytics (no-show vs completed) honest.

---

## 7. Complete appointment

### 1. Purpose

Close the clinical visit (`CHECKED_IN` → `COMPLETED`).

### 2. Endpoint

`/appointments/{id}/complete`

### 3. HTTP Method

`PATCH`

**Server Action:** `completeAppointment`

### 4. Authentication

Required.

### 5. Authorization

| Role | Access |
|------|--------|
| `admin` | ✓ |
| `doctor` (future) | ✓ own schedule |
| `patient` | ✗ |

### 6. Request Body

```json
{
  "notes": "Optional completion notes"
}
```

`notes` optional.

### 7. Query Parameters

None.

### 8. Path Parameters

| Param | Type |
|-------|------|
| `id` | ObjectId |

### 9. Validation Rules

Valid `id`; optional `notes` length.

### 10. Business Rules

- **Must** be `CHECKED_IN` — cannot complete before check-in
- Already `COMPLETED` → idempotent `200`
- Does not auto-issue prescription (separate module)
- Cannot complete `CANCELLED` / `NO_SHOW`

### 11. Success Response

```json
{
  "success": true,
  "data": { "id": "…", "status": "COMPLETED" },
  "meta": { "requestId": "req_01JEXAMPLE" }
}
```

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INVALID_STATUS_TRANSITION`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `404`, `422`, `500`

### 14. Related Collections

`appointments` (Rx linked later via `prescriptions`)

### 15. Sequence Diagram — Complete Appointment

```
Admin/Doctor        completeAppointment     Service              MongoDB
  │ PATCH .../complete │                     │                    │
  │───────────────────►│ requireRole         │                    │
  │                    │────────────────────►│ status CHECKED_IN? │
  │                    │                     │ → COMPLETED        │
  │◄──── 200 ──────────│ revalidate          │                    │
```

### 16. Notes

UI may deep-link to “Issue prescription” after success; that is not part of this endpoint.

---

## 8. Cancel appointment

### 1. Purpose

Cancel a bookable-stage appointment and release inventory when policy allows.

### 2. Endpoint

`/appointments/{id}/cancel`

### 3. HTTP Method

`PATCH`

**Server Action:** `cancelAppointment`

### 4. Authentication

Required.

### 5. Authorization

| Role | Access |
|------|--------|
| `patient` | Own only; within `cancellationCutoffHours` |
| `admin` | Any; may override cutoff |
| `doctor` (future) | Own schedule |

### 6. Request Body

```json
{
  "cancellationReason": "Schedule conflict"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `cancellationReason` | Recommended | Required for patient; admin may omit with default |

### 7. Query Parameters

None.

### 8. Path Parameters

| Param | Type |
|-------|------|
| `id` | ObjectId |

### 9. Validation Rules

- Valid `id`
- Reason max length

### 10. Business Rules

1. Allowed from `PENDING` or `CONFIRMED` only (v1).
2. Not from `CHECKED_IN`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `ARCHIVED`.
3. Patient cancel after cutoff → `CANCEL_WINDOW_EXPIRED`.
4. **Transaction:** set appointment `CANCELLED` + `cancelledAt` + `cancelledByUserId`; release slot to `AVAILABLE` if still future and product policy says so; else leave slot non-bookable.
5. Already `CANCELLED` → idempotent `200`.

### 11. Success Response

```json
{
  "success": true,
  "data": {
    "id": "…",
    "status": "CANCELLED",
    "cancellationReason": "Schedule conflict",
    "cancelledAt": "2026-07-15T12:00:00.000Z"
  },
  "meta": { "requestId": "req_01JEXAMPLE" }
}
```

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INVALID_STATUS_TRANSITION`, `CANCEL_WINDOW_EXPIRED`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `404`, `422`, `500`

### 14. Related Collections

`appointments`, `slots`, `users`, `clinic_settings`

### 15. Sequence Diagram — Cancel Appointment

```
Patient/Admin       cancelAppointment       Service              MongoDB
  │ PATCH .../cancel   │                      │                    │
  │───────────────────►│ authz + cutoff       │                    │
  │                    │─────────────────────►│ begin txn          │
  │                    │                      │ appt → CANCELLED   │
  │                    │                      │ slot → AVAILABLE?* │
  │                    │                      │ commit             │
  │◄──── 200 ──────────│◄─────────────────────│                    │

* If startAt still in future and policy allows release.
```

### 16. Notes

`NO_SHOW` is a distinct terminal for missed confirmed visits; do not overload cancel for no-shows when analytics matter.

---

## 9. Reschedule appointment

### 1. Purpose

Move an active appointment to a different `AVAILABLE` slot atomically.

### 2. Endpoint

`/appointments/{id}/reschedule`

### 3. HTTP Method

`PATCH`

**Server Action:** `rescheduleAppointment`

### 4. Authentication

Required.

### 5. Authorization

| Role | Access |
|------|--------|
| `patient` | Own; within cancel/reschedule cutoff; same booking rules as create |
| `admin` | Any patient |
| `doctor` (future) | Own schedule |

### 6. Request Body

```json
{
  "newSlotId": "665f1c2a9a1b2c3d4e5f6800",
  "reason": "Need a later time"
}
```

| Field | Required |
|-------|----------|
| `newSlotId` | ✓ |
| `reason` | optional note / audit |

### 7. Query Parameters

None.

### 8. Path Parameters

| Param | Type |
|-------|------|
| `id` | ObjectId |

### 9. Validation Rules

- Valid ObjectIds
- `newSlotId` ≠ current `slotId`

### 10. Business Rules

1. Appointment status must be `PENDING` or `CONFIRMED` only — **cannot reschedule completed / cancelled / checked-in / archived**.
2. New slot must be `AVAILABLE`, same clinic rules as book; preferably same `doctorId` unless admin allows doctor change via different slot’s doctor.
3. **Transaction (atomic):**
   - Conditional book new slot `AVAILABLE` → `BOOKED`
   - Update appointment: `slotId`, `startsAt`/`endsAt` snapshots, `doctorId` + `doctorSnapshot` from new slot
   - Release old slot → `AVAILABLE` (clear `appointmentId`)
   - Set status to **`PENDING`** (requires reconfirm)
4. Unique `slotId` on appointments still holds (update in place, not second row).
5. Race on new slot → `SLOT_NOT_AVAILABLE` / `DOUBLE_BOOKING`.

### 11. Success Response

```json
{
  "success": true,
  "data": {
    "id": "…",
    "status": "PENDING",
    "slotId": "665f1c2a9a1b2c3d4e5f6800",
    "startsAt": "2026-07-21T04:30:00.000Z",
    "endsAt": "2026-07-21T05:00:00.000Z"
  },
  "meta": { "requestId": "req_01JEXAMPLE" }
}
```

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `APPOINTMENT_NOT_RESCHEDULABLE`, `SLOT_NOT_AVAILABLE`, `DOUBLE_BOOKING`, `INVALID_DOCTOR`, `BOOKING_RULE_VIOLATION`, `CLINIC_CLOSED`, `CANCEL_WINDOW_EXPIRED`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `404`, `409`, `422`, `500`

### 14. Related Collections

`appointments`, `slots`, `doctors`, `clinic_settings`, `holidays`

### 15. Sequence Diagram — Reschedule Appointment

```
Patient/Admin       rescheduleAppointment   Service              MongoDB
  │ PATCH .../reschedule │                    │                    │
  │─────────────────────►│ authz + rules      │                    │
  │                      │───────────────────►│ begin txn          │
  │                      │                    │ new slot AVAILABLE?│
  │                      │                    │ new slot → BOOKED  │
  │                      │                    │ update appt slot   │
  │                      │                    │ status → PENDING   │
  │                      │                    │ old slot → AVAILABLE
  │                      │                    │ commit / abort     │
  │◄── 200 | 409 ────────│◄───────────────────│                    │
```

### 16. Notes

In-place reschedule preserves `appointmentId` continuity for linked drafts; alternative “cancel + new book” remains acceptable historically but v1 standardizes on this atomic swap.

---

## 10. Appointment history

### 1. Purpose

Past / terminal visits for a patient timeline (completed, cancelled, no-show, archived).

### 2. Endpoint

`/appointments/history`

### 3. HTTP Method

`GET`

**Server Action:** `getAppointmentHistory`

### 4. Authentication

Required.

### 5. Authorization

| Role | Scope |
|------|--------|
| `patient` | Self only |
| `admin` | Optional `patientId` query (required if not self-context) |
| `doctor` (future) | Own patients’ history for own `doctorId` optional filter |

### 6. Request Body

None.

### 7. Query Parameters

| Param | Notes |
|-------|-------|
| `page`, `limit`, `sort` | Default `startsAt:desc` |
| `patientId` | Admin |
| `status` | Subset filter among history statuses |
| `from`, `to` | Date window |
| `doctorId` | Admin/doctor |

**Default status set:** `COMPLETED`, `CANCELLED`, `NO_SHOW`, `ARCHIVED` (and optionally past `CHECKED_IN` should not appear — those are active).

### 8. Path Parameters

None.

### 9. Validation Rules

Shared pagination + ObjectId rules.

### 10. Business Rules

- Exclude active queue statuses (`PENDING`, `CONFIRMED`, `CHECKED_IN`) by default
- Patient cannot pass another `patientId`

### 11. Success Response

Same list envelope as §1 with history rows.

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `INVALID_PATIENT`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `422`, `500`

### 14. Related Collections

`appointments`

### 15. Sequence Diagram

```
Client → getAppointmentHistory → scope patientId → Mongo find history → 200 list
```

### 16. Notes

Mobile patient “History” tab should call this rather than over-filtering the generic list.

---

## 11. Upcoming appointments

### 1. Purpose

Future active appointments for reminders and portal home.

### 2. Endpoint

`/appointments/upcoming`

### 3. HTTP Method

`GET`

**Server Action:** `getUpcomingAppointments`

### 4. Authentication

Required.

### 5. Authorization

Same ownership rules as list (`patient` self, `admin` optional filters, future `doctor` self).

### 6. Request Body

None.

### 7. Query Parameters

`page`, `limit`, `sort` (default `startsAt:asc`), `patientId`, `doctorId`, `status` (subset of active), `from` (default now), `to` (optional horizon).

### 8. Path Parameters

None.

### 9. Validation Rules

Shared list validation; default `startsAt >= now`.

### 10. Business Rules

- Default statuses: `PENDING`, `CONFIRMED` (optionally include `CHECKED_IN` if same-day still “upcoming” — **recommend exclude** `CHECKED_IN` here; use `/today`)
- Exclude cancelled/completed/no-show/archived

### 11. Success Response

List envelope; **HTTP** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `500`

### 14. Related Collections

`appointments`

### 15. Sequence Diagram

```
Client → upcoming → filter startsAt>=now + active statuses → 200
```

### 16. Notes

Ideal for patient home widget; keep payload lean (no heavy embeds).

---

## 12. Today’s appointments

### 1. Purpose

Clinic day board: appointments whose local clinic date equals “today.”

### 2. Endpoint

`/appointments/today`

### 3. HTTP Method

`GET`

**Server Action:** `getTodaysAppointments`

### 4. Authentication

Required.

### 5. Authorization

| Role | Access |
|------|--------|
| `admin` | Full day board; filter `doctorId` |
| `doctor` (future) | Own `doctorId` only |
| `patient` | Own appointments only (limited personal “today”) |

### 6. Request Body

None.

### 7. Query Parameters

| Param | Notes |
|-------|-------|
| `doctorId` | Admin filter |
| `status` | e.g. `CONFIRMED,CHECKED_IN` |
| `page`, `limit`, `sort` | Default `startsAt:asc` |
| `date` | Optional ISO date override (admin); default clinic “today” via `clinic_settings.timezone` |

### 8. Path Parameters

None.

### 9. Validation Rules

Timezone-aware day bounds derived server-side; do not trust client local midnight alone.

### 10. Business Rules

- Compute `[dayStart, dayEnd)` in clinic timezone
- Primary admin ops view for confirm / check-in / complete
- Include `PENDING` for confirmation queue same day

### 11. Success Response

List envelope; **HTTP** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `500`

### 14. Related Collections

`appointments`, `clinic_settings`

### 15. Sequence Diagram

```
Admin → /today → resolve tz day window → query doctor/day → 200 board
```

### 16. Notes

Pair with calendar for multi-day planning; `/today` stays the operational default.

---

## 13. Appointment calendar

### 1. Purpose

Range calendar feed for admin/doctor scheduling UIs (and limited patient view).

### 2. Endpoint

`/appointments/calendar`

### 3. HTTP Method

`GET`

**Server Action:** `getAppointmentCalendar`

### 4. Authentication

Required.

### 5. Authorization

| Role | Access |
|------|--------|
| `admin` | Clinic-wide |
| `doctor` (future) | Own `doctorId` |
| `patient` | Own events only (privacy-safe fields) |

### 6. Request Body

None.

### 7. Query Parameters

| Param | Required | Notes |
|-------|----------|-------|
| `from` | ✓ | Range start ISO |
| `to` | ✓ | Range end ISO; max span clamped (e.g. 62 days) |
| `doctorId` | | Admin / doctor |
| `patientId` | | Admin |
| `status` | | Optional filter |

No traditional page pagination required for small ranges; if span large, require pagination or denser summary mode.

### 8. Path Parameters

None.

### 9. Validation Rules

- `from` < `to`
- Max range enforcement → else `VALIDATION_ERROR`
- ObjectId filters validated

### 10. Business Rules

- Return compact events: `id`, `status`, `startsAt`, `endsAt`, doctor/patient display fields per role
- Patients must not see other patients’ names on shared doctor calendars
- Do not CDN-cache authorized calendar feeds

### 11. Success Response

```json
{
  "success": true,
  "data": {
    "from": "2026-07-01T00:00:00.000Z",
    "to": "2026-08-01T00:00:00.000Z",
    "events": [
      {
        "id": "665f…",
        "status": "CONFIRMED",
        "startsAt": "2026-07-20T04:30:00.000Z",
        "endsAt": "2026-07-20T05:00:00.000Z",
        "doctorId": "665f…",
        "patientLabel": "Asha V."
      }
    ]
  },
  "meta": { "requestId": "req_01JEXAMPLE" }
}
```

**HTTP:** `200`

### 12. Error Responses

`UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `INTERNAL_ERROR`

### 13. HTTP Status Codes

`200`, `400`, `401`, `403`, `500`

### 14. Related Collections

`appointments`, `clinic_settings`

### 15. Sequence Diagram

```
Client → calendar?from&to → authz scope → range query → 200 events
```

### 16. Notes

Slots availability calendar remains a **slots** API concern; this endpoint returns **booked visits**, not open inventory.

---

# Actor Flows

## Admin flow

1. View `/appointments/today` and `/appointments/calendar`
2. Confirm `PENDING` → `CONFIRMED`
3. Check-in → `CHECKED_IN`
4. Complete → `COMPLETED`
5. Optionally cancel / reschedule / book on behalf of patient
6. Hand off to prescriptions module after complete

## Patient flow

1. Browse available slots (slots API)
2. `POST /appointments` → `PENDING`
3. Track via `/upcoming` and `/appointments/{id}`
4. Cancel or reschedule within cutoff
5. After visit + Rx issued, read `/history` and prescriptions API

## Future doctor flow

1. `/today` + `/calendar` scoped to own `doctorId`
2. Confirm / check-in / complete for own appointments
3. No clinic-wide patient PHI lists beyond assigned schedule
4. Issue Rx post-complete (prescriptions API)

---

# Error Scenarios (quick reference)

| Scenario | Code | HTTP |
|----------|------|------|
| Slot already booked / race lost | `SLOT_NOT_AVAILABLE` or `DOUBLE_BOOKING` | 409 |
| Invalid / inactive doctor | `INVALID_DOCTOR` | 422 |
| Invalid / inactive patient | `INVALID_PATIENT` | 422 |
| Appointment not found / hidden | `NOT_FOUND` | 404 |
| Missing session | `UNAUTHORIZED` | 401 |
| Patient confirms / completes | `FORBIDDEN` | 403 |
| Confirm cancelled appt | `INVALID_STATUS_TRANSITION` | 422 |
| Complete before check-in | `INVALID_STATUS_TRANSITION` | 422 |
| Reschedule completed appt | `APPOINTMENT_NOT_RESCHEDULABLE` | 422 |
| Patient cancel past cutoff | `CANCEL_WINDOW_EXPIRED` | 422 |
| Holiday / closed | `CLINIC_CLOSED` | 422 |

---

# Canonical workflow ASCII diagrams

## 1. Book Appointment

```
Patient/Admin            Next.js Action         BookingService           MongoDB
     │                         │                      │                     │
     │ POST /appointments      │                      │                     │
     │────────────────────────►│ requireAppUser       │                     │
     │                         │ Zod + authz          │                     │
     │                         │─────────────────────►│ startSession        │
     │                         │                      │ slot AVAILABLE?     │
     │                         │                      │ insert PENDING      │
     │                         │                      │ slot → BOOKED       │
     │                         │                      │ (abort if race)     │
     │                         │◄──── commit/fail ────│                     │
     │◄── 201 / 409 ───────────│ revalidate           │                     │
```

## 2. Confirm Appointment

```
Admin                    confirmAppointment     ApptService              MongoDB
  │ PATCH /{id}/confirm       │                     │                     │
  │──────────────────────────►│ requireRole(admin)  │                     │
  │                           │────────────────────►│ PENDING→CONFIRMED   │
  │◄────────── 200 ───────────│◄────────────────────│                     │
```

## 3. Cancel Appointment

```
Patient/Admin            cancelAppointment      ApptService              MongoDB
  │ PATCH /{id}/cancel        │                     │                     │
  │──────────────────────────►│ ownership + cutoff  │                     │
  │                           │────────────────────►│ txn: CANCELLED      │
  │                           │                     │ release slot?*      │
  │◄────────── 200 ───────────│◄────────────────────│                     │
```

## 4. Reschedule Appointment

```
Patient/Admin            rescheduleAppointment  ApptService              MongoDB
  │ PATCH /{id}/reschedule    │                     │                     │
  │ { newSlotId }             │                     │                     │
  │──────────────────────────►│ authz + rules       │                     │
  │                           │────────────────────►│ txn:                │
  │                           │                     │  book new slot      │
  │                           │                     │  update appt        │
  │                           │                     │  free old slot      │
  │                           │                     │  status→PENDING     │
  │◄────── 200 / 409 ─────────│◄────────────────────│                     │
```

## 5. Complete Appointment

```
Admin/Doctor             completeAppointment    ApptService              MongoDB
  │ PATCH /{id}/complete      │                     │                     │
  │──────────────────────────►│ requireRole         │                     │
  │                           │────────────────────►│ must be CHECKED_IN  │
  │                           │                     │ → COMPLETED         │
  │◄────────── 200 ───────────│◄────────────────────│                     │
  │                           │ (Rx issued later in prescriptions API)    │
```

---

# Documentation checklist (guidelines §11)

| Concern | Location |
|---------|----------|
| Purpose / auth / authz / request / validation / business rules / response / errors / status / collections | Per-endpoint §1–§14 |
| Lifecycle & transitions | Appointment Lifecycle |
| Filtering / sorting / search / pagination | Cross-Cutting |
| Actor flows | Admin / Patient / Doctor |
| Sequence diagrams | Per endpoint + canonical § |

---

*End of Appointments API design. No application code in this document.*
