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
