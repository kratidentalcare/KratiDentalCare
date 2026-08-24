# Appointment Email Notification & Approval Workflow

Automated admin/patient emails for public appointment bookings, with secure
token-gated Approve / Cancel / Reschedule actions.

## 1. Email provider setup

| Variable | Purpose |
|----------|---------|
| `EMAIL_PROVIDER` | `resend` or `console` (default / fallback) |
| `EMAIL_FROM` | From header, e.g. `Krati Dental Care <onboarding@resend.dev>` |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_ACTION_SECRET` | Optional pepper mixed into action-token hashes |
| `EMAIL_ACTION_TOKEN_TTL_HOURS` | Token lifetime (default `72`) |
| `NEXT_PUBLIC_APP_URL` | Absolute links in emails and CTAs |

Development: leave Resend unset (or set `EMAIL_PROVIDER=console`). Sends are
logged safely to the server console and never crash booking.

Production: set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM`, and a
strong `EMAIL_ACTION_SECRET`.

## 2. Email template architecture

Templates live under `features/email/templates/`:

1. `admin-new-appointment.ts` — clinic admin on new `PENDING` booking
2. `patient-approved.ts` — patient after approve → `CONFIRMED`
3. `patient-cancelled.ts` — patient after cancel
4. `patient-rescheduled.ts` — patient after reschedule

Shared layout (`layout.ts`) renders email-safe HTML (tables + inline CSS).
Branding is loaded from Clinic Settings (`getClinicEmailBranding()`), not hardcoded.

## 3. Admin approval flow

1. Patient books via `/book-appointment` → `createPublicBooking` → `PENDING`
2. `onAppointmentCreated` enqueues `NotificationOutbox` EMAIL row and dispatches
3. Admin receives email with Approve / Cancel / Reschedule buttons
4. Approve link → `/appointment-actions?t=…&action=approve`
5. Server verifies token, requires `PENDING`, calls `performAppointmentAction({ action: "approve" })`
6. Consumes the whole token bundle
7. `onAppointmentConfirmed` sends patient confirmation email

## 4. Cancellation flow

1. Cancel link → `/appointment-actions?t=…&action=cancel`
2. Intermediate confirm page (optional reason)
3. `performAppointmentAction({ action: "cancel", cancellationReason })`
4. Token bundle consumed
5. Patient receives cancellation email

## 5. Rescheduling flow

1. Reschedule link → `/appointment-actions/reschedule?t=…` (public, not `/admin`)
2. Token verified without consuming
3. Page loads patient/current slot + dynamic slots via `getRescheduleAvailability`
4. Admin confirms new slot → `performAppointmentAction({ action: "reschedule", … })`
5. Token bundle consumed; patient reschedule email sent

## 6. Secure token mechanism

- Model: `appointment_action_tokens`
- Opaque `randomBytes(32)` token; only SHA-256 hash stored (optional secret pepper)
- Bundle of three actions (approve/cancel/reschedule) sharing `bundleId`
- Expiry via `expiresAt`
- Single-use: successful action (or already-processed detection) consumes the bundle
- URLs contain **no** patient PII

## 7. Email logging

`NotificationOutbox` EMAIL rows are the EmailLog:

- `appointmentId`, `recipient`, `emailType`, `status`, `providerMessageId`, `sentAt`, `lastError`
- Types: `ADMIN_NEW_APPOINTMENT`, `PATIENT_APPROVED`, `PATIENT_CANCELLED`, `PATIENT_RESCHEDULED`
- Claim path: `PENDING` → `SENDING` → `SENT` / `FAILED`

## 8. Duplicate prevention

- Outbox unique `idempotencyKey` = `{appointmentId}:{eventType}:EMAIL`
- Only one claim from `PENDING` can proceed
- Lifecycle transitions + optimistic concurrency prevent double approve/cancel
- Second click on the same approve link shows “already processed”

## 9. Failure handling

- Booking / lifecycle DB success is never rolled back for email failures
- Enqueue and dispatch are wrapped in best-effort try/catch
- Failures set outbox `FAILED` + `lastError` and are console-logged

## 10. Environment variables required

See `.env.example` and section 1 above.

## 11. Testing procedure

Automated:

```bash
npm test
```

Includes `features/email/email-workflow.test.ts` (mapping, hashing, console provider, templates, page preview).

Manual:

| Test | Steps | Expected |
|------|-------|----------|
| 1 | Book appointment as patient | Admin email arrives (or console log) |
| 2 | Click Approve | Status `CONFIRMED`; patient confirmation email |
| 3 | Book again; click Cancel → confirm | Status `CANCELLED`; patient cancel email |
| 4 | Book again; click Reschedule → pick slot | Times update; patient reschedule email |
| 5 | Use an expired/old token | “invalid or has expired” |
| 6 | Approve the same approve link twice | Second attempt does not mutate again |
| 7 | Break Resend (bad key) then book | Appointment still created; outbox `FAILED` |

Dashboard: email actions use the same `performAppointmentAction` path as the
admin appointments UI, so status and times stay in sync.
