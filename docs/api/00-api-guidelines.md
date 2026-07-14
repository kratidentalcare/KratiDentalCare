# 00 — API Guidelines

**Project:** Krati Dental Care — Dental Clinic Management System  
**Status:** Approved foundation (no endpoint contracts in this document)  
**Audience:** Backend, frontend, and QA engineers implementing and consuming APIs  
**Related:** [../03-system-architecture.md](../03-system-architecture.md) · [../04-database-design.md](../04-database-design.md) · [../database-architecture.md](../database-architecture.md)

---

## Document purpose

This file defines the **API design contract** for the project: philosophy, auth, payloads, errors, pagination, security, and documentation standards.

Resource-specific endpoint catalogs live in sibling files (`01`–`09`) and must follow every rule herein. Those catalogs are **not** designed in this document.

---

## Implementation note (App Router)

Primary mutation/query surface in V1 is **Next.js Server Actions** behind authenticated UI, with **Route Handlers** reserved for webhooks, signed downloads, and future public/machine APIs.

These guidelines still apply:

| Concern | Apply equally to |
|---------|------------------|
| Authn / authz / validation / errors | Server Actions **and** Route Handlers |
| Resource naming & status semantics | Logical resources (`appointments`, `slots`, …) |
| REST URL shapes in §8 | Canonical **resource identity**; map 1:1 when exposing HTTP routes |

When documenting a Server Action, treat it as an operation on the same resource (e.g. `bookAppointment` ≡ `POST /appointments`) and fill the same endpoint template (§11).

---

## 1. API Philosophy

### 1.1 REST principles

- Model the domain as **resources** (nouns), not RPC procedure dumps as the default style.
- Use uniform operations (read / create / update / delete / constrained actions) with predictable semantics.
- Resources are addressable by stable identifiers (`id`).
- Representations are JSON unless streaming binary (PDF).
- Favor explicit status codes over overloading `200` with error payloads for HTTP APIs.
- Keep side effects out of safe methods (`GET` / read-only Server Actions used for queries).

### 1.2 Resource naming

| Rule | Example |
|------|---------|
| Plural nouns | `/appointments`, `/doctors` |
| `kebab-case` path segments | `/clinic-settings` |
| Nested only when ownership is strict | `/patients/{id}/prescriptions` (optional) |
| Avoid verbs in paths | Prefer `POST /appointments` over `/createAppointment` |
| Actions as sub-resources when needed | `POST /appointments/{id}/confirm` |

Logical resource names must match domain collections conceptually (`appointments`, `slots`, `patients`, `doctors`, `prescriptions`, etc.).

### 1.3 HTTP methods

| Method | Semantics | Typical use |
|--------|-----------|-------------|
| `GET` | Safe, idempotent read | List / get by id |
| `POST` | Create or non-idempotent action | Create appointment; confirm when modeled as action |
| `PATCH` | Partial update | Update patient phone; amend draft fields |
| `PUT` | Full replace (use sparingly) | Rare; prefer `PATCH` |
| `DELETE` | Remove or soft-delete | Soft-delete preferred for clinical data |

Server Action naming should mirror intent: `get*`, `list*`, `create*`, `update*`, `delete*`, plus explicit verbs for workflow (`confirm*`, `void*`).

### 1.4 Stateless design

- Each request/action carries its own authentication context (Clerk session / bearer).
- Server does not rely on hidden in-memory client affinity for authz decisions.
- Business state lives in MongoDB (appointments, slots), not in server process memory.
- Pagination cursors/pages are client-supplied; do not store “current page” server-side per user session.

### 1.5 Idempotency

| Operation | Expectation |
|-----------|-------------|
| `GET` | Idempotent |
| `PATCH` / soft `DELETE` | Idempotent where practical (repeat yields same terminal state) |
| `POST` create | Not idempotent by default |
| Booking (`POST` appointment) | Protect with DB constraints + transactions; optional `Idempotency-Key` for HTTP clients later |
| Workflow actions (`confirm`) | Must be safe to retry: confirming an already `CONFIRMED` appointment returns success or `409` with clear code — pick one project rule and apply consistently (**recommend:** return current state + `200` if already confirmed) |

### 1.6 Versioning strategy

**V1 (current):** Unversioned App Router paths and Server Actions inside the monolith.

**When external/mobile HTTP APIs ship:**

- Prefix Route Handlers with `/api/v1/...`
- Do not break existing clients; add `/api/v2` for breaking changes
- Deprecate with docs + sunset window; never silent behavior changes on the same version

Header-based versioning is **not** preferred for this project.

---

## 2. Authentication Strategy

### 2.1 Clerk authentication

- Clerk is the identity provider (sign-up, sign-in, session, MFA options).
- The API layer never stores passwords.
- On the server, resolve the Clerk user via official server helpers, then load the MongoDB `users` document by `clerkId`.

### 2.2 Session validation

Every privileged Server Action / protected Route Handler must:

1. Require a valid Clerk session (or verified webhook signature for webhooks).
2. Load `users` where `clerkId` matches and `isActive` is true / `deletedAt` is null.
3. Fail closed with `401` semantics if session or app user is missing.

Public website reads (published CMS) may omit auth; writes never do.

### 2.3 Role-based authorization

Roles live on MongoDB `users.role` (`UserRole` enum — see database addendum).

| Check | When |
|-------|------|
| `requireRole("admin")` | Admin-only resources |
| `requireRole(["admin","doctor"])` | Clinical ops as product allows |
| Patient portal | `role === "patient"` plus ownership |

Role checks occur **before** business mutations. UI hiding is not authorization.

### 2.4 Ownership validation

For patient-scoped resources:

- Patients may only read/mutate **their** `patientId` data.
- Admins may act on behalf of any patient where product rules allow.
- Prescription downloads require ownership (or admin) **and** allowed `PrescriptionStatus`.

Always enforce ownership in the service/action layer, not only in list query filters.

---

## 3. Standard Request Format

### 3.1 Content types

- JSON APIs: `Content-Type: application/json`
- Multipart only for controlled uploads (see `08-file-upload.md` later)
- Server Actions: structured FormData or typed action arguments validated by Zod

### 3.2 Identifiers

- Path/resource ids: MongoDB `ObjectId` strings
- Validate with Zod `objectId` helper before DB access
- Reject malformed ids with `400` / validation error — not `500`

### 3.3 Request body shape (HTTP)

```json
{
  "patientId": "665f1c2a9a1b2c3d4e5f6789",
  "slotId": "665f1c2a9a1b2c3d4e5f6790",
  "reason": "Tooth pain"
}
```

Rules:

- Prefer flat, explicit fields over deeply nested envelopes
- Do not send `_id`, `createdAt`, `updatedAt` from clients on create
- Do not accept privilege fields from clients (`role`, `status` transitions reserved to workflow endpoints)
- Dates as ISO-8601 strings in UTC (or document timezone handling via `clinic_settings.timezone`)

### 3.4 Headers (HTTP Route Handlers)

| Header | Use |
|--------|-----|
| `Authorization` / session cookie | Clerk session (as configured) |
| `Idempotency-Key` | Optional on creates (future public API) |
| `X-Request-Id` | Optional client correlation; server may generate if absent |

---

## 4. Standard Response Format

All HTTP JSON responses use a consistent envelope. Server Actions should return an equivalent typed `ActionResult` that maps to the same semantics.

### 4.1 Success response

```json
{
  "success": true,
  "data": {
    "id": "665f1c2a9a1b2c3d4e5f6789",
    "status": "PENDING"
  },
  "meta": {
    "requestId": "req_01JEXAMPLE"
  }
}
```

List success:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "requestId": "req_01JEXAMPLE",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

### 4.2 Validation error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "slotId",
        "message": "Invalid ObjectId"
      },
      {
        "field": "reason",
        "message": "String must contain at most 500 character(s)"
      }
    ]
  },
  "meta": {
    "requestId": "req_01JEXAMPLE"
  }
}
```

### 4.3 Business error response

```json
{
  "success": false,
  "error": {
    "code": "SLOT_NOT_AVAILABLE",
    "message": "This slot is no longer available for booking"
  },
  "meta": {
    "requestId": "req_01JEXAMPLE"
  }
}
```

### 4.4 Unauthorized response

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  },
  "meta": {
    "requestId": "req_01JEXAMPLE"
  }
}
```

### 4.5 Forbidden response

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  },
  "meta": {
    "requestId": "req_01JEXAMPLE"
  }
}
```

### 4.6 Not found response

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Appointment not found"
  },
  "meta": {
    "requestId": "req_01JEXAMPLE"
  }
}
```

### 4.7 Internal server error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  },
  "meta": {
    "requestId": "req_01JEXAMPLE"
  }
}
```

Never expose stack traces, Mongo error internals, or secrets in `message` / `details` in production.

---

## 5. HTTP Status Code Standards

| Code | Name | When to use |
|------|------|-------------|
| **200** | OK | Successful read or update; successful workflow action that returns a body |
| **201** | Created | Successful resource creation (`POST` create) |
| **204** | No Content | Successful delete/soft-delete with no body (optional; `200` + data also acceptable if documented) |
| **400** | Bad Request | Malformed JSON, malformed ObjectId, unsupported query combo |
| **401** | Unauthorized | Missing/invalid session |
| **403** | Forbidden | Authenticated but role/ownership fails |
| **404** | Not Found | Resource id does not exist **or** is hidden by ownership (avoid leaking existence of others’ PHI — prefer `404` over `403` for cross-patient reads when appropriate) |
| **409** | Conflict | Double-booking race, duplicate unique key, illegal concurrent state |
| **422** | Unprocessable Entity | Semantically invalid but well-formed input (Zod business-shaped failures); project may map Zod field errors to **400** — **standardize on 400 for validation** and reserve **422** for domain rule failures that are not conflicts, **or** use **400** for all validation and **409** for conflicts. **Chosen standard:** validation → **400**; domain conflict → **409**; other domain rule failures → **422** |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unexpected failures |

**Server Actions:** Map the same codes into `ActionResult.error.code` even when HTTP status is implicitly `200` on the action transport; UI must branch on `success` + `error.code`.

---

## 6. Validation Rules

### 6.1 Zod validation

- Every mutation input has a Zod schema under `validators/`.
- Shared primitives: ObjectId, email, phone, pagination, status enums.
- Client (RHF) may reuse schemas for UX; **server always re-validates**.

### 6.2 Server-side validation

- Runs at the action/route boundary before services mutate state.
- On failure → `VALIDATION_ERROR` + field `details` (§4.2).
- Strip unknown keys (`zod` strict or strip) to prevent mass assignment.

### 6.3 Business validation

Occurs in `services/` after authz:

| Example | Outcome |
|---------|---------|
| Slot not `AVAILABLE` | `422` / `409` + `SLOT_NOT_AVAILABLE` |
| Appointment not `PENDING` on confirm | `422` + `INVALID_STATUS_TRANSITION` |
| Rx download when `DRAFT` | `403` or `422` + `PRESCRIPTION_NOT_DOWNLOADABLE` |
| Holiday date booking | `422` + `CLINIC_CLOSED` |

Business rules never trust the client’s proposed `status` unless the endpoint’s purpose is that transition.

---

## 7. Pagination Standard

### 7.1 Query parameters (list endpoints)

| Param | Type | Default | Rules |
|-------|------|---------|-------|
| `page` | integer ≥ 1 | `1` | 1-based page index |
| `limit` | integer | `20` | Max **100**; clamp server-side |
| `sort` | string | resource-specific | e.g. `startsAt:desc`, `createdAt:desc` |
| `search` | string | — | Trimmed; applied to allowlisted fields only |
| `filters` | repeated query or nested object | — | Allowlisted keys only (`status`, `doctorId`, `from`, `to`) |

Example:

```http
GET /appointments?page=1&limit=20&sort=startsAt:desc&status=CONFIRMED&doctorId=665f...
```

### 7.2 Pagination meta

Always return:

```json
{
  "page": 1,
  "limit": 20,
  "total": 135,
  "totalPages": 7
}
```

### 7.3 Performance rules

- Prefer indexed filter fields (`patientId + startsAt`, etc.).
- Do not allow arbitrary Mongo sort paths from the client.
- For admin large exports, use a dedicated export flow later — not unbounded `limit`.

---

## 8. API Naming Conventions

Canonical HTTP shapes (for Route Handlers / future public API). Server Actions must map to the same resources.

```http
GET    /appointments
POST   /appointments
GET    /appointments/{id}
PATCH  /appointments/{id}
DELETE /appointments/{id}

POST   /appointments/{id}/confirm
POST   /appointments/{id}/cancel

GET    /slots
POST   /slots
PATCH  /slots/{id}

GET    /patients
POST   /patients
GET    /patients/{id}
PATCH  /patients/{id}

GET    /doctors
POST   /doctors
GET    /doctors/{id}
PATCH  /doctors/{id}

GET    /prescriptions
POST   /prescriptions
GET    /prescriptions/{id}
POST   /prescriptions/{id}/issue
POST   /prescriptions/{id}/void
GET    /prescriptions/{id}/download
```

Conventions:

- Plural collection paths
- `{id}` = Mongo ObjectId
- Workflow verbs as **POST** sub-resources
- Soft delete via `DELETE` or `POST /{id}/archive` when archival is a workflow — document per resource later

**Do not expand full catalogs here** — that belongs in `02`–`07`.

---

## 9. Error Handling Standard

### 9.1 Error object schema

```ts
{
  success: false;
  error: {
    code: string;          // machine-stable SCREAMING_SNAKE
    message: string;       // human-safe summary
    details?: Array<{      // optional field issues
      field: string;
      message: string;
    }>;
  };
  meta: {
    requestId: string;
  };
}
```

### 9.2 Error code conventions

| Pattern | Example |
|---------|---------|
| Auth | `UNAUTHORIZED`, `FORBIDDEN` |
| Generic | `NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`, `RATE_LIMITED` |
| Domain | `SLOT_NOT_AVAILABLE`, `INVALID_STATUS_TRANSITION`, `DOUBLE_BOOKING` |

Codes are part of the public contract — do not rename casually.

### 9.3 Logging

- Log `requestId`, `error.code`, actor id, resource id on failures.
- Do not log full prescription medication payloads at info level.
- Unexpected exceptions → `INTERNAL_ERROR` to client + detailed server log.

---

## 10. Security Standards

### 10.1 Authentication

- Clerk session required for all non-public operations.
- Webhooks: verify signatures; never trust raw body alone.

### 10.2 Authorization

- RBAC + ownership on every mutating and sensitive read path.
- Deny by default.

### 10.3 Rate limiting

- Protect booking, auth-adjacent, and download endpoints.
- Return `429` + `RATE_LIMITED` when exceeded.

### 10.4 Input validation

- Zod at the boundary; enum allowlists; length caps; unknown-key stripping.

### 10.5 Sensitive data

- Minimize PHI in URLs and logs.
- Do not return other patients’ resources.
- Prefer `404` for cross-tenant/patient probing where it reduces leakage.

### 10.6 File upload security

- Authz-gated uploads; MIME/size allowlists; store binaries in object storage/CDN.
- Prescription PDFs: short-lived signed URLs after ownership checks (see future `08-file-upload.md`).

### 10.7 Transport & headers

- HTTPS only in production.
- Hardened security headers at the edge.
- No secrets in client bundles (`NEXT_PUBLIC_*` only for publishable values).

---

## 11. API Documentation Standards

Every endpoint (or Server Action equivalent) documented in `01`–`09` **must** include the following sections, in order:

1. **Purpose** — one short paragraph  
2. **Authentication** — required or public  
3. **Authorization** — roles + ownership  
4. **Request** — method/path or action name; headers; params; body example  
5. **Validation** — Zod schema summary / field rules  
6. **Business Rules** — status transitions, conflicts, side effects (e.g. slot flip)  
7. **Response** — success JSON example  
8. **Errors** — table of `error.code` values  
9. **Status Codes** — allowed HTTP statuses  
10. **Related Collections** — Mongo collections touched  

Optional but recommended: idempotency notes, revalidation tags, sequence references to system architecture.

### 11.1 Documentation file ownership

| File | Resource area |
|------|----------------|
| `01-authentication.md` | Auth/session/bootstrap |
| `02-appointments.md` | Appointments |
| `03-slots.md` | Slots |
| `04-patients.md` | Patients |
| `05-doctors.md` | Doctors |
| `06-prescriptions.md` | Prescriptions |
| `07-website.md` | Settings + CMS |
| `08-file-upload.md` | Uploads / PDF |
| `09-future-apis.md` | Roadmap only |

---

## 12. Best Practices

1. **Thin handlers, rich services** — authz + Zod in the edge; invariants in `services/`.  
2. **Transactions for multi-document flows** — especially booking (slot + appointment).  
3. **Stable error codes** — UI and mobile clients branch on `code`, not English `message`.  
4. **No mass assignment** — never bind request body directly to Mongoose without allowlists.  
5. **Soft delete / status machines** — prefer domain statuses over hard deletes for clinical data.  
6. **Pagination everywhere lists can grow** — appointments, patients, admin Rx queues.  
7. **Explicit workflow endpoints** — `confirm` / `void` beat generic `PATCH status`.  
8. **Revalidate deliberately** — after mutations, revalidate only affected paths/tags.  
9. **Design for mobile-first clients** — small payloads; avoid over-fetching embeds unless required.  
10. **Document before building** — endpoint template (§11) completed prior to implementation of that resource.  
11. **Prefer 409 for booking races** — clients can retry with a fresh slot list.  
12. **Keep public CMS reads cacheable; keep availability reads fresh** — per system architecture caching rules.  
13. **Version only when exposing external HTTP APIs** — avoid premature `/v1` inside Server Actions.  
14. **Test authz negative paths** — patient accessing another patient’s id must fail.  
15. **Align enums with database addendum** — `AppointmentStatus`, `SlotStatus`, etc., never local synonyms.

---

## Out of scope for this document

- Concrete appointment, slot, patient, doctor, prescription, or website endpoint catalogs  
- OpenAPI/Swagger generation  
- Implementation of Server Actions or Route Handlers  

---

*End of API guidelines. Foundation only — no resource APIs designed herein.*
