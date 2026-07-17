import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from "@/constants/statuses";
import { isTerminalAppointmentStatus } from "@/features/appointments/lib/lifecycle";

/** Statuses counted toward a patient's total visit history. */
export function isCountedAppointmentStatus(status: AppointmentStatus): boolean {
  return status !== APPOINTMENT_STATUSES.ARCHIVED;
}

export function isCompletedAppointmentStatus(
  status: AppointmentStatus,
): boolean {
  return status === APPOINTMENT_STATUSES.COMPLETED;
}

export function isCancelledAppointmentStatus(
  status: AppointmentStatus,
): boolean {
  return status === APPOINTMENT_STATUSES.CANCELLED;
}

/** Future visits that should appear as "Next Appointment". */
export function isUpcomingAppointmentCandidate(
  status: AppointmentStatus,
  startsAt: Date,
  now: Date = new Date(),
): boolean {
  return (
    !isTerminalAppointmentStatus(status) &&
    status !== APPOINTMENT_STATUSES.ARCHIVED &&
    startsAt.getTime() >= now.getTime()
  );
}

export function classifyAppointmentForStats(status: AppointmentStatus): {
  total: boolean;
  completed: boolean;
  cancelled: boolean;
} {
  return {
    total: isCountedAppointmentStatus(status),
    completed: isCompletedAppointmentStatus(status),
    cancelled: isCancelledAppointmentStatus(status),
  };
}
