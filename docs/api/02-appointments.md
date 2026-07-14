# 02 — Appointments API

## Purpose

Document appointment resource operations (book, confirm, cancel, list, get, complete, no-show).

## Scope

- Appointment CRUD-style and workflow endpoints / Server Actions
- Status transitions (`PENDING` → `CONFIRMED` → …)
- Coordination with slots during booking and cancellation

## Status

**Placeholder** — not yet designed.

## Future Sections

- List / get appointments
- Create (book) appointment
- Confirm / cancel / complete / no-show
- Patient vs admin authorization matrices
- Error codes (`SLOT_NOT_AVAILABLE`, `INVALID_STATUS_TRANSITION`, …)
