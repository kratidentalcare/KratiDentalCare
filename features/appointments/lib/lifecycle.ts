import type { AppointmentStatus } from "@/constants/statuses";
import { APPOINTMENT_STATUSES } from "@/constants/statuses";

/** Statuses that block doctor occupancy in the scheduling engine. */
export const BLOCKING_APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  APPOINTMENT_STATUSES.PENDING,
  APPOINTMENT_STATUSES.CONFIRMED,
  APPOINTMENT_STATUSES.CHECKED_IN,
  APPOINTMENT_STATUSES.COMPLETED,
  APPOINTMENT_STATUSES.NO_SHOW,
];

/**
 * Open visit statuses that occupy a patient's public booking hold.
 * Distinct from occupancy blocking (which includes COMPLETED / NO_SHOW).
 */
export const BOOKING_HOLD_STATUSES: readonly AppointmentStatus[] = [
  APPOINTMENT_STATUSES.PENDING,
  APPOINTMENT_STATUSES.CONFIRMED,
  APPOINTMENT_STATUSES.CHECKED_IN,
];

const BOOKING_HOLD_STATUS_SET = new Set<AppointmentStatus>(BOOKING_HOLD_STATUSES);

/** Admin-facing lifecycle transitions. */
const ALLOWED_TRANSITIONS: Record<
  AppointmentStatus,
  readonly AppointmentStatus[]
> = {
  [APPOINTMENT_STATUSES.PENDING]: [
    APPOINTMENT_STATUSES.CONFIRMED,
    APPOINTMENT_STATUSES.CANCELLED,
  ],
  [APPOINTMENT_STATUSES.CONFIRMED]: [
    APPOINTMENT_STATUSES.COMPLETED,
    APPOINTMENT_STATUSES.CANCELLED,
  ],
  [APPOINTMENT_STATUSES.CHECKED_IN]: [APPOINTMENT_STATUSES.COMPLETED],
  [APPOINTMENT_STATUSES.COMPLETED]: [],
  [APPOINTMENT_STATUSES.CANCELLED]: [],
  [APPOINTMENT_STATUSES.NO_SHOW]: [],
  [APPOINTMENT_STATUSES.ARCHIVED]: [],
};

export function canTransitionAppointmentStatus(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransitionAllowed(
  from: AppointmentStatus,
  to: AppointmentStatus,
): void {
  if (!canTransitionAppointmentStatus(from, to)) {
    throw new Error(`Invalid appointment transition: ${from} → ${to}`);
  }
}

export function canRescheduleAppointment(
  status: AppointmentStatus,
  startsAt: Date,
  now: Date = new Date(),
): boolean {
  return (
    (status === APPOINTMENT_STATUSES.PENDING ||
      status === APPOINTMENT_STATUSES.CONFIRMED) &&
    startsAt.getTime() > now.getTime()
  );
}

export function isTerminalAppointmentStatus(status: AppointmentStatus): boolean {
  return (
    status === APPOINTMENT_STATUSES.COMPLETED ||
    status === APPOINTMENT_STATUSES.CANCELLED ||
    status === APPOINTMENT_STATUSES.NO_SHOW ||
    status === APPOINTMENT_STATUSES.ARCHIVED
  );
}

/**
 * True when this visit should prevent another public self-service booking.
 * Unclosed PENDING / CONFIRMED / CHECKED_IN rows block until staff closes them.
 */
export function isAppointmentBlockingNewBooking(input: {
  status: AppointmentStatus;
  deletedAt?: Date | null;
}): boolean {
  if (input.deletedAt != null) {
    return false;
  }
  return BOOKING_HOLD_STATUS_SET.has(input.status);
}
