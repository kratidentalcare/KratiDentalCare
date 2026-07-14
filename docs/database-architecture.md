# Database Architecture — Krati Dental Care

**Phase:** Planning only (no Mongoose models yet)  
**Database:** MongoDB  
**Auth source of truth:** Clerk (identity); MongoDB stores app profiles and domain data  

---

## 1. Design principles

1. **Identity vs domain** — Clerk owns authentication. MongoDB owns clinic domain data and links via `clerkId` / `userId`.
2. **Reference entities that change independently** — users, doctors, patients, slots, appointments.
3. **Embed data that is always read together and rarely queried alone** — prescription line items, address blocks, appointment display snapshots.
4. **Slots are first-class documents** — enables dynamic admin control, atomic booking, and conflict prevention.
5. **Immutable history where it matters** — snapshots on appointments/prescriptions so renames don’t rewrite history.
6. **Soft deletes for clinical records** — prefer `status` / `isActive` / `deletedAt` over hard deletes for patients, appointments, prescriptions.
7. **Single-clinic first, multi-tenant ready** — optional `clinicId` reserved for future; omit enforced multi-tenancy in v1.

---

## 2. Collection overview

| Collection | Purpose |
|------------|---------|
| `users` | App user profile bridged to Clerk (role, link to doctor/patient) |
| `doctors` | Doctor professional profile and practice metadata |
| `patients` | Patient clinical/demographic profile |
| `slots` | Bookable time windows (dynamic availability) |
| `appointments` | Booked visits linking patient + doctor + slot |
| `prescriptions` | E-prescriptions issued by doctors |
| `clinic_contents` | **Deprecated** — superseded by modular CMS in [04-database-design.md](./04-database-design.md) |

Optional later (not in v1 core): `audit_logs`, `notifications`, `files`.  
**V1 website/ops (addendum):** `clinic_settings`, `website_settings`, `services`, `testimonials`, `faqs`, `holidays`.

---

## 3. Collection specifications

### 3.1 `users`

**Purpose:** Bridge Clerk accounts to application roles and domain profiles. One document per signed-in identity used by the app.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | Primary key |
| `clerkId` | string | ✓ | | Clerk user id (`user_...`) |
| `email` | string | ✓ | | Synced from Clerk; lowercase |
| `role` | enum string | ✓ | | `admin` \| `doctor` \| `patient` |
| `doctorId` | ObjectId \| null | | ✓ | Ref → `doctors` when role is doctor |
| `patientId` | ObjectId \| null | | ✓ | Ref → `patients` when role is patient |
| `isActive` | boolean | ✓ | | Default `true` |
| `lastLoginAt` | Date \| null | | ✓ | |
| `createdAt` | Date | ✓ | | |
| `updatedAt` | Date | ✓ | | |

**Relationships**
- 1:1 with Clerk user (`clerkId`)
- 0..1 → `doctors` via `doctorId`
- 0..1 → `patients` via `patientId`
- Admin users typically have neither `doctorId` nor `patientId`

**Index recommendations**
- Unique: `{ clerkId: 1 }`
- Unique: `{ email: 1 }`
- `{ role: 1, isActive: 1 }`

**Validation recommendations**
- `role` must be one of allowed enum values
- If `role === "doctor"` → `doctorId` required; `patientId` null
- If `role === "patient"` → `patientId` required; `doctorId` null
- If `role === "admin"` → both refs null (or optional doctor self-manage later)
- Email format + lowercase normalization

**Why**
- Separates auth provider from clinic domain models.
- Supports “staff who is also a doctor” later by relaxing admin rules without schema rewrite.

---

### 3.2 `doctors`

**Purpose:** Canonical doctor records for scheduling, appointments, and prescriptions (managed by admin).

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `userId` | ObjectId \| null | | ✓ | Ref → `users` (portal login) |
| `fullName` | string | ✓ | | Display name |
| `slug` | string | ✓ | | URL-safe unique identifier |
| `email` | string | ✓ | | Clinic contact email |
| `phone` | string | | ✓ | E.164 preferred |
| `specialties` | string[] | ✓ | | At least one |
| `qualification` | string | | ✓ | Degrees / registration summary |
| `bio` | string | | ✓ | Public profile text |
| `registrationNumber` | string | | ✓ | Dental council / license id |
| `yearsOfExperience` | number | | ✓ | ≥ 0 |
| `consultationDurationMinutes` | number | ✓ | | Default slot length hint (e.g. 30) |
| `isAcceptingAppointments` | boolean | ✓ | | Gate for booking |
| `isActive` | boolean | ✓ | | Soft disable |
| `displayOrder` | number | | ✓ | Website listing order |
| `avatarUrl` | string \| null | | ✓ | Future Cloudinary URL |
| `createdAt` | Date | ✓ | | |
| `updatedAt` | Date | ✓ | | |
| `deletedAt` | Date \| null | | ✓ | Soft delete |

**Relationships**
- 0..1 ← `users.doctorId` / `doctors.userId`
- 1 → many `slots`
- 1 → many `appointments`
- 1 → many `prescriptions`

**Index recommendations**
- Unique: `{ slug: 1 }`
- Unique sparse: `{ userId: 1 }` (only when set)
- Unique: `{ email: 1 }`
- `{ isActive: 1, isAcceptingAppointments: 1, displayOrder: 1 }`

**Validation recommendations**
- `specialties.length >= 1`
- `consultationDurationMinutes` in allowed set (15, 20, 30, 45, 60)
- Soft-deleted doctors cannot accept new bookings (app rule)

**Why separate from `users`**
- Admin may create a doctor profile before inviting them to log in.
- Public website needs doctor content without auth records.

---

### 3.3 `patients`

**Purpose:** Patient demographics and clinic relationship; appointment/prescription history hangs off this record.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `userId` | ObjectId \| null | | ✓ | Ref → `users` (patient portal) |
| `fullName` | string | ✓ | | |
| `email` | string | ✓ | | |
| `phone` | string | ✓ | | Primary contact |
| `dateOfBirth` | Date | | ✓ | Age calculations |
| `gender` | enum string | | ✓ | `female` \| `male` \| `other` \| `prefer_not_to_say` |
| `bloodGroup` | string | | ✓ | Optional clinical hint |
| `address` | object | | ✓ | **Embedded** (see below) |
| `emergencyContact` | object | | ✓ | **Embedded** |
| `allergies` | string[] | | ✓ | Critical for prescriptions |
| `medicalNotes` | string | | ✓ | Admin/doctor internal notes |
| `isActive` | boolean | ✓ | | |
| `createdAt` | Date | ✓ | | |
| `updatedAt` | Date | ✓ | | |
| `deletedAt` | Date \| null | | ✓ | |

**Embedded `address`**
| Field | Type | Required |
|-------|------|----------|
| `line1` | string | ✓ (if address present) |
| `line2` | string | |
| `city` | string | ✓ |
| `state` | string | ✓ |
| `postalCode` | string | ✓ |
| `country` | string | ✓ (default `IN`) |

**Embedded `emergencyContact`**
| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✓ |
| `phone` | string | ✓ |
| `relation` | string | |

**Relationships**
- 0..1 ← `users.patientId`
- 1 → many `appointments`
- 1 → many `prescriptions`

**Index recommendations**
- Unique sparse: `{ userId: 1 }`
- `{ email: 1 }`
- `{ phone: 1 }`
- Text or compound search: `{ fullName: 1, phone: 1 }` for admin lookup

**Validation recommendations**
- Phone required for booking/reminders
- Email unique preferred (sparse unique if walk-in patients lack email later — v1: required + unique)
- Admin can create patient without portal `userId` (walk-in / phone booking)

**Why**
- Clinical/contact data belongs on patient, not Clerk.
- Walk-in support without forcing signup at create time.

---

### 3.4 `slots`

**Purpose:** Dynamically managed bookable time windows per doctor. Admin creates/opens/blocks/cancels slots; patients book available ones.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `doctorId` | ObjectId | ✓ | | Ref → `doctors` |
| `startAt` | Date | ✓ | | UTC ISO instant |
| `endAt` | Date | ✓ | | Must be > `startAt` |
| `status` | enum string | ✓ | | `available` \| `booked` \| `blocked` \| `cancelled` |
| `appointmentId` | ObjectId \| null | | ✓ | Ref → `appointments` when booked |
| `createdByUserId` | ObjectId | ✓ | | Ref → `users` (admin/doctor who created) |
| `notes` | string | | ✓ | Internal (e.g. “blocked — surgery”) |
| `createdAt` | Date | ✓ | | |
| `updatedAt` | Date | ✓ | | |

**Relationships**
- many → 1 `doctors`
- 0..1 → `appointments` (via `appointmentId`; bidirectional with `appointments.slotId`)
- many → 1 `users` (`createdByUserId`)

**Index recommendations**
- Unique: `{ doctorId: 1, startAt: 1 }` — prevents duplicate windows
- `{ doctorId: 1, status: 1, startAt: 1 }` — list available slots
- `{ startAt: 1, endAt: 1 }` — range queries / cleanup jobs
- `{ appointmentId: 1 }` sparse unique when set

**Validation recommendations**
- `endAt > startAt`
- Duration aligns with doctor `consultationDurationMinutes` (app rule; allow admin override)
- Transition rules:
  - `available` → `booked` \| `blocked` \| `cancelled`
  - `booked` → `cancelled` (only with appointment cancel flow)
  - `blocked` → `available` \| `cancelled`
- Cannot book `blocked` / `cancelled` / past slots
- Booking must set `appointmentId` and status `booked` atomically

**Why first-class slots (not free-form datetime only)**
- Admin “manage slots dynamically” maps cleanly to CRUD on documents.
- Race conditions solved with status + unique doctor/start + conditional update (`status: available` → `booked`).
- Future: generate slots from weekly templates without changing booking API.

**What not to embed**
- Do not embed full appointment inside slot — appointment lifecycle is richer (status, notes, history).

---

### 3.5 `appointments`

**Purpose:** Record of a scheduled (or past) visit. Source of patient appointment history and prescription linkage.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `patientId` | ObjectId | ✓ | | Ref → `patients` |
| `doctorId` | ObjectId | ✓ | | Ref → `doctors` |
| `slotId` | ObjectId | ✓ | | Ref → `slots` (unique) |
| `status` | enum string | ✓ | | `scheduled` \| `checked_in` \| `completed` \| `cancelled` \| `no_show` |
| `reason` | string | | ✓ | Patient/admin visit reason |
| `notes` | string | | ✓ | Internal clinical/admin notes |
| `cancellationReason` | string | | ✓ | |
| `cancelledAt` | Date \| null | | ✓ | |
| `cancelledByUserId` | ObjectId \| null | | ✓ | Ref → `users` |
| `bookedByUserId` | ObjectId | ✓ | | Patient or admin who booked |
| `startsAt` | Date | ✓ | | **Snapshot** from slot.startAt |
| `endsAt` | Date | ✓ | | **Snapshot** from slot.endAt |
| `patientSnapshot` | object | ✓ | | **Embedded** denormalized display |
| `doctorSnapshot` | object | ✓ | | **Embedded** denormalized display |
| `createdAt` | Date | ✓ | | |
| `updatedAt` | Date | ✓ | | |

**Embedded `patientSnapshot`**
| Field | Type | Required |
|-------|------|----------|
| `fullName` | string | ✓ |
| `phone` | string | ✓ |
| `email` | string | ✓ |

**Embedded `doctorSnapshot`**
| Field | Type | Required |
|-------|------|----------|
| `fullName` | string | ✓ |
| `specialties` | string[] | ✓ |

**Relationships**
- many → 1 `patients`
- many → 1 `doctors`
- 1:1 with `slots` (`slotId` unique)
- 0..1 ← many `prescriptions` (usually 0..n over life; often 1 per visit)

**Index recommendations**
- Unique: `{ slotId: 1 }`
- `{ patientId: 1, startsAt: -1 }` — patient history
- `{ doctorId: 1, startsAt: -1 }` — doctor day schedule
- `{ status: 1, startsAt: 1 }` — ops dashboards
- `{ bookedByUserId: 1, createdAt: -1 }`

**Validation recommendations**
- On create: slot must be `available`, same `doctorId`, not in the past
- Status machine enforced in service layer
- Cancel restores or cancels slot (product rule: prefer slot → `available` if still in future, else `cancelled`)
- Completed appointments should not reopen without audit trail

**Why snapshots**
- History remains readable if patient/doctor renames occur.
- Listing history avoids joins for common fields.

**Why keep `slotId` + `startsAt`/`endsAt`**
- `slotId` enforces single booking per slot.
- Snapshotted times protect history if slot document is later adjusted/archived.

---

### 3.6 `prescriptions`

**Purpose:** E-prescriptions patients can view/download; admins/doctors manage issuance and updates.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `prescriptionNumber` | string | ✓ | | Human-readable unique id |
| `patientId` | ObjectId | ✓ | | Ref → `patients` |
| `doctorId` | ObjectId | ✓ | | Ref → `doctors` |
| `appointmentId` | ObjectId \| null | | ✓ | Ref → `appointments` |
| `status` | enum string | ✓ | | `draft` \| `issued` \| `amended` \| `void` |
| `diagnosis` | string | ✓ | | When `issued` |
| `advice` | string | | ✓ | Care instructions |
| `medications` | object[] | ✓ | | **Embedded array** (min 1 when issued) |
| `issuedAt` | Date \| null | | ✓ | Set when status → `issued` |
| `validUntil` | Date \| null | | ✓ | Optional validity |
| `pdfUrl` | string \| null | | ✓ | Future Cloudinary / storage URL |
| `patientSnapshot` | object | ✓ | | Name/age/phone at issue time |
| `doctorSnapshot` | object | ✓ | | Name/qualification at issue time |
| `createdByUserId` | ObjectId | ✓ | | Ref → `users` |
| `voidReason` | string | | ✓ | |
| `createdAt` | Date | ✓ | | |
| `updatedAt` | Date | ✓ | | |

**Embedded `medications[]` item**
| Field | Type | Required | Optional |
|-------|------|----------|----------|
| `name` | string | ✓ | |
| `dosage` | string | ✓ | | e.g. `500mg` |
| `frequency` | string | ✓ | | e.g. `1-0-1` / `twice daily` |
| `duration` | string | ✓ | | e.g. `5 days` |
| `route` | string | | ✓ | oral, topical, etc. |
| `instructions` | string | | ✓ | “after food” |
| `quantity` | string | | ✓ | |

**Relationships**
- many → 1 `patients`
- many → 1 `doctors`
- many → 0..1 `appointments`
- many → 1 `users` (`createdByUserId`)

**Index recommendations**
- Unique: `{ prescriptionNumber: 1 }`
- `{ patientId: 1, issuedAt: -1 }` — patient downloads/history
- `{ doctorId: 1, issuedAt: -1 }`
- `{ appointmentId: 1 }` sparse
- `{ status: 1, updatedAt: -1 }`

**Validation recommendations**
- `draft` may allow empty medications; `issued` requires ≥ 1 medication + diagnosis
- Prefer void + new amendment over destructive edits after issue (clinical audit)
- Patient download allowed only for `issued` / `amended` (not `draft` / `void`)
- `appointmentId`, if set, must belong to same patient + doctor

**Why embed medications**
- Always loaded with the prescription; never queried as standalone catalog in v1.
- Avoids join/N+1 for PDF generation and downloads.
- Medication master library can be added later without breaking this embed.

---

### 3.7 `clinic_contents`

**Purpose:** Admin-managed website content (hero copy, about, services, contact blurb, SEO snippets) without a separate CMS.

| Field | Type | Required | Optional | Notes |
|-------|------|----------|----------|-------|
| `_id` | ObjectId | ✓ | | |
| `key` | string | ✓ | | e.g. `home.hero`, `about`, `contact`, `services` |
| `title` | string | | ✓ | |
| `body` | string | | ✓ | Markdown or rich text |
| `blocks` | object[] | | ✓ | Structured sections for flexible pages |
| `metadata` | object | | ✓ | SEO title/description, image URLs |
| `isPublished` | boolean | ✓ | | |
| `updatedByUserId` | ObjectId | ✓ | | Ref → `users` |
| `createdAt` | Date | ✓ | | |
| `updatedAt` | Date | ✓ | | |

**Relationships**
- many → 1 `users` (`updatedByUserId`)
- No hard refs to clinical collections

**Index recommendations**
- Unique: `{ key: 1 }`
- `{ isPublished: 1 }`

**Validation recommendations**
- `key` slug pattern: `^[a-z0-9]+(\.[a-z0-9_-]+)*$`
- Published pages must have either `body` or non-empty `blocks`

**Why**
- Meets “manage website content” without coupling marketing copy to clinical schemas.
- Keyed documents scale better than one giant settings blob.

---

## 4. Reference vs embed summary

### Reference (store ObjectId)

| From | To | Reason |
|------|----|--------|
| `users.doctorId` / `users.patientId` | `doctors` / `patients` | Role bridge; entities evolve separately |
| `doctors.userId` / `patients.userId` | `users` | Optional portal linkage |
| `slots.doctorId` | `doctors` | Many slots per doctor |
| `slots.appointmentId` | `appointments` | Booking pointer |
| `appointments.patientId` | `patients` | History & ownership |
| `appointments.doctorId` | `doctors` | Schedule & filtering |
| `appointments.slotId` | `slots` | Exclusive booking |
| `prescriptions.patientId` / `doctorId` / `appointmentId` | respective | Ownership & clinical chain |
| `*.createdByUserId` / `bookedByUserId` | `users` | Auditability |

### Embed (subdocuments)

| Parent | Embedded | Reason |
|--------|----------|--------|
| `patients` | `address`, `emergencyContact` | Co-owned contact data; not shared entities |
| `appointments` | `patientSnapshot`, `doctorSnapshot` | Stable history / list performance |
| `prescriptions` | `medications[]`, snapshots | Always read together; PDF/download unit |
| `clinic_contents` | `blocks[]`, `metadata` | Page-local structure |

### Do **not** embed

- Full patient medical history inside appointments
- Full slot calendars inside doctors (unbounded growth)
- Prescriptions inside appointments (multiple Rx over time; download queries by patient)

---

## 5. Critical booking consistency rules

Atomic booking pattern (to implement later in services):

1. Find slot where `_id = X` AND `status = "available"` AND `startAt > now`.
2. Create `appointments` document.
3. Update slot to `status: "booked"`, `appointmentId: <newId>` in the same logical transaction (MongoDB multi-doc transaction recommended).
4. Unique `{ doctorId, startAt }` + unique `{ slotId }` on appointments prevent double-booking under concurrency.

Cancel flow:

1. Set appointment `status: cancelled` + metadata.
2. If slot still in future → set slot `available` and clear `appointmentId`; else set slot `cancelled`.

---

## 6. ER diagram (text)

```
┌────────────────┐         ┌────────────────┐
│     users      │         │ clinic_contents│
│────────────────│         │────────────────│
│ clerkId (UQ)   │         │ key (UQ)       │
│ email (UQ)     │         │ updatedByUserId│──┐
│ role           │◄────────┼────────────────┘  │
│ doctorId ──────┼──┐      └────────────────┘  │
│ patientId ─────┼─┐│                          │
└───────┬────────┘ ││                          │
        │          ││                          │
        │          ││    ┌────────────────┐    │
        │          │└───►│    doctors     │◄───┘ (audit refs omitted)
        │          │     │────────────────│
        │          │     │ userId (sparse)│
        │          │     │ slug (UQ)      │
        │          │     └───────┬────────┘
        │          │             │ 1
        │          │             │
        │          │             │ *          ┌────────────────┐
        │          │             ├───────────►│     slots      │
        │          │             │            │────────────────│
        │          │             │            │ doctorId       │
        │          │             │            │ startAt / endAt│
        │          │             │            │ status         │
        │          │             │            │ appointmentId ─│──┐
        │          │             │            └────────────────┘  │
        │          │             │                                │
        │          │             │ *                              │ 1
        │          │             ├───────────►┌────────────────┐◄─┘
        │          │             │            │  appointments  │
        │          │             │            │────────────────│
        │          └─────────────┼───────────►│ patientId      │
        │                        │            │ doctorId       │
        │                        │            │ slotId (UQ)    │
        │                        │            │ snapshots...   │
        │                        │            └───────┬────────┘
        │                        │                    │ 0..*
        │                        │                    ▼
        │                        │            ┌────────────────┐
        │                        └───────────►│ prescriptions  │
        │                                     │────────────────│
        └────────────────────────────────────►│ patientId      │
                                              │ doctorId       │
                                              │ appointmentId? │
                                              │ medications[]  │
                                              │ pdfUrl?        │
                                              └────────────────┘

Legend: ──► reference (ObjectId)     * / 1 = cardinality
```

---

## 7. Collection relationship diagram (cardinality)

```
users 1 ──────── 0..1 doctors
users 1 ──────── 0..1 patients

doctors 1 ─────── * slots
doctors 1 ─────── * appointments
doctors 1 ─────── * prescriptions

patients 1 ────── * appointments
patients 1 ────── * prescriptions

slots 1 ───────── 0..1 appointments     (enforced unique slotId)
appointments 1 ── 0..* prescriptions

users 1 ───────── * slots.createdByUserId
users 1 ───────── * appointments.bookedByUserId
users 1 ───────── * prescriptions.createdByUserId
users 1 ───────── * clinic_contents.updatedByUserId
```

---

## 8. Capability → collection map

| Capability | Primary collections | Notes |
|------------|---------------------|-------|
| Patient books appointment | `slots`, `appointments`, `patients`, `doctors` | Atomic status flip on slot |
| Patient views history | `appointments` | Filter by `patientId`, sort `startsAt` |
| Patient downloads Rx | `prescriptions` | `status in issued/amended`; serve `pdfUrl` or generate |
| Admin manages doctors | `doctors` (+ optional `users` invite) | Soft deactivate |
| Admin manages slots | `slots` | Create / block / cancel |
| Admin manages appointments | `appointments`, `slots` | Reschedule = cancel + new book |
| Admin manages patients | `patients` | Optional portal link |
| Admin manages prescriptions | `prescriptions` | Draft → issue → void/amend |
| Admin website content | `clinic_contents` | Keyed pages |

---

## 9. Future scalability considerations

1. **Multi-clinic / SaaS tenancy** — Add `clinicId` to all domain collections; compound indexes become `{ clinicId, ... }`. Keep Clerk org ↔ clinic mapping.
2. **Slot generation** — Add `schedule_rules` (weekly templates) + job to materialize `slots`; booking still targets `slots` only.
3. **Rescheduling** — Prefer new appointment + cancel old (immutable audit) over mutating `slotId` in place.
4. **Files** — Introduce `files` collection or Cloudinary metadata on `prescriptions.pdfUrl` / `doctors.avatarUrl`; never store binaries in MongoDB.
5. **Notifications** — Outbox/`notifications` collection for WhatsApp/email reminders keyed by `appointmentId`.
6. **Audit logs** — Append-only `audit_logs` for clinical voids, appointment cancels, role changes (compliance).
7. **Search** — Atlas Search on `patients.fullName`, `phone`, `prescriptionNumber` when admin lists grow.
8. **Read models** — If dashboards grow heavy, maintain daily aggregates (`doctorId + date` utilization) via change streams.
9. **Sharding keys (much later)** — Likely `clinicId` or `patientId` depending on access patterns; avoid early sharding.
10. **GDPR / retention** — Soft delete + scheduled anonymization job for inactive patients; keep prescription legal retention separate from marketing content.

---

## 10. Explicit non-goals for v1 schema

- Inventory / billing / payments collections
- Lab order management
- Full EHR charting (odontogram, visit SOAP notes as separate collections)
- Medication drug database / RxNorm integration
- Real-time chat

These can attach later without rewriting the core appointment/slot/Rx graph above.

---

## 11. Recommended implementation order (when coding starts)

1. `users` + Clerk webhook/sync  
2. `doctors`, `patients`  
3. `slots` + booking transaction → `appointments`  
4. `prescriptions` (+ PDF generation later)  
5. `clinic_contents`  

---

*Document status: approved for planning. No Mongoose models generated yet.*
