# Scheduling Architecture (Phase 14)

## Folder structure

```text
constants/scheduling.ts
models/clinic-settings/
models/schedule-override/
validators/{clinic-settings,schedule-override,availability}.ts
features/scheduling/
  engine/                 # pure slot generation (no I/O)
  lib/                    # timezone + interval helpers
  services/               # DB orchestration
  actions/                # admin Server Actions
  components/             # dashboard UI
app/(dashboard)/dashboard/scheduling/page.tsx
app/api/availability/route.ts
```

## Data flow

```text
Selected civil date (YYYY-MM-DD)
  → load ClinicSettings (singleton)
  → check working day
  → check Holiday (one-off / recurring)
  → check ScheduleOverride (ALL_DAY / TIME_RANGE)
  → generate candidate intervals from hours + duration
  → subtract breaks + time blocks + active appointments
  → subtract elapsed times for today
  → return AvailabilityResult DTO
```

No slot inventory documents are created.

## Patient booking consumption

Future patient UI calls the same contract:

- Server Action / `GET /api/availability?date=YYYY-MM-DD`
- Render `result.slots[]` only when `status === "available"`
- On book: re-run `generateAvailableSlots`, verify the chosen ISO window is still present, then insert an `Appointment` with `slotId: null`

## Extensibility

| Future need | Extension point |
|-------------|-----------------|
| Multiple doctors | Pass `doctorId`; filter appointments/overrides by doctor; optional doctor hours overlay |
| Different durations | Pass `durationMinutes` (already supported by engine + API) |
| Doctor-specific hours | Merge doctor schedule over clinic defaults before `generateSlotsForDate` |
| Multiple branches | Scope `ClinicSettings.clinicKey` / overrides by branch id + timezone |

## Legacy Slot model

`models/slot` remains for historical appointments that still reference `slotId`. New bookings do not write Slot rows.
