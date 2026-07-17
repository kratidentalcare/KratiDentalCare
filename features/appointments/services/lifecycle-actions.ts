import "server-only";

import { Types } from "mongoose";

import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import {
  canRescheduleAppointment,
  canTransitionAppointmentStatus,
} from "@/features/appointments/lib/lifecycle";
import { buildOccupancyKey } from "@/features/appointments/lib/occupancy";
import { assertSlotAvailableForBooking } from "@/features/appointments/services/booking-availability";
import {
  onAppointmentCancelled,
  onAppointmentCompleted,
  onAppointmentConfirmed,
  onAppointmentRescheduled,
} from "@/features/appointments/services/notification-events";
import { getAppointmentDetail } from "@/features/appointments/services/list-appointments";
import type { AppointmentDetail } from "@/features/appointments/types";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { connect } from "@/lib/db";
import {
  ConflictError,
  DomainError,
  NotFoundError,
} from "@/lib/errors";
import { Appointment, type LeanAppointment } from "@/models/appointment";
import type { AppointmentActionInput } from "@/validators/appointment-booking";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

async function loadAppointment(id: string): Promise<LeanAppointment> {
  await connect();
  const appointment = await Appointment.findOne({
    _id: new Types.ObjectId(id),
    deletedAt: null,
  }).lean<LeanAppointment>();

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  return appointment;
}

export async function performAppointmentAction(
  id: string,
  input: AppointmentActionInput,
  actorUserId: string,
): Promise<AppointmentDetail> {
  const appointment = await loadAppointment(id);

  switch (input.action) {
    case "approve":
      return approveAppointment(appointment, actorUserId);
    case "cancel":
      return cancelAppointment(
        appointment,
        actorUserId,
        input.cancellationReason,
      );
    case "complete":
      return completeAppointment(appointment, actorUserId);
    case "reschedule":
      return rescheduleAppointment(appointment, actorUserId, input);
    default: {
      const _exhaustive: never = input;
      throw new DomainError("INVALID_ACTION", "Unsupported action");
    }
  }
}

async function approveAppointment(
  appointment: LeanAppointment,
  actorUserId: string,
): Promise<AppointmentDetail> {
  if (
    !canTransitionAppointmentStatus(
      appointment.status,
      APPOINTMENT_STATUSES.CONFIRMED,
    )
  ) {
    throw new DomainError(
      "INVALID_TRANSITION",
      `Cannot approve an appointment in ${appointment.status} status`,
    );
  }

  const updated = await Appointment.findOneAndUpdate(
    {
      _id: appointment._id,
      status: appointment.status,
      deletedAt: null,
    },
    {
      $set: { status: APPOINTMENT_STATUSES.CONFIRMED },
    },
    { new: true },
  ).lean<LeanAppointment>();

  if (!updated) {
    throw new ConflictError("Appointment was modified by another user");
  }

  await onAppointmentConfirmed(updated, actorUserId);
  return getAppointmentDetail(String(updated._id));
}

async function cancelAppointment(
  appointment: LeanAppointment,
  actorUserId: string,
  cancellationReason: string,
): Promise<AppointmentDetail> {
  if (
    !canTransitionAppointmentStatus(
      appointment.status,
      APPOINTMENT_STATUSES.CANCELLED,
    )
  ) {
    throw new DomainError(
      "INVALID_TRANSITION",
      `Cannot cancel an appointment in ${appointment.status} status`,
    );
  }

  const now = new Date();

  const updated = await Appointment.findOneAndUpdate(
    {
      _id: appointment._id,
      status: appointment.status,
      deletedAt: null,
    },
    {
      $set: {
        status: APPOINTMENT_STATUSES.CANCELLED,
        cancellationReason: cancellationReason.trim(),
        cancelledAt: now,
        cancelledByUserId: new Types.ObjectId(actorUserId),
        occupancyKey: null,
      },
    },
    { new: true },
  ).lean<LeanAppointment>();

  if (!updated) {
    throw new ConflictError("Appointment was modified by another user");
  }

  await onAppointmentCancelled(updated, actorUserId, cancellationReason);
  return getAppointmentDetail(String(updated._id));
}

async function completeAppointment(
  appointment: LeanAppointment,
  actorUserId: string,
): Promise<AppointmentDetail> {
  if (
    !canTransitionAppointmentStatus(
      appointment.status,
      APPOINTMENT_STATUSES.COMPLETED,
    )
  ) {
    throw new DomainError(
      "INVALID_TRANSITION",
      `Cannot complete an appointment in ${appointment.status} status`,
    );
  }

  const now = new Date();

  const updated = await Appointment.findOneAndUpdate(
    {
      _id: appointment._id,
      status: appointment.status,
      deletedAt: null,
    },
    {
      $set: {
        status: APPOINTMENT_STATUSES.COMPLETED,
        checkedInAt: appointment.checkedInAt ?? now,
        completedAt: now,
      },
    },
    { new: true },
  ).lean<LeanAppointment>();

  if (!updated) {
    throw new ConflictError("Appointment was modified by another user");
  }

  await onAppointmentCompleted(updated, actorUserId);
  return getAppointmentDetail(String(updated._id));
}

async function rescheduleAppointment(
  appointment: LeanAppointment,
  actorUserId: string,
  input: Extract<AppointmentActionInput, { action: "reschedule" }>,
): Promise<AppointmentDetail> {
  if (!canRescheduleAppointment(appointment.status, appointment.startsAt)) {
    throw new DomainError(
      "INVALID_TRANSITION",
      "Only future pending or confirmed appointments can be rescheduled",
    );
  }

  const settings = await getOrCreateClinicSettings();
  const startsAt = new Date(input.startAt);
  const endsAt = new Date(input.endAt);
  const date = input.date;

  await assertSlotAvailableForBooking({
    date,
    startAt: startsAt,
    endAt: endsAt,
    excludeAppointmentId: String(appointment._id),
  });

  const occupancyKey = buildOccupancyKey(String(appointment.doctorId), startsAt);
  const previous = {
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
  };

  try {
    const updated = await Appointment.findOneAndUpdate(
      {
        _id: appointment._id,
        status: appointment.status,
        deletedAt: null,
      },
      {
        $set: {
          startsAt,
          endsAt,
          occupancyKey,
          rescheduledFromStartsAt: previous.startsAt,
          rescheduledFromEndsAt: previous.endsAt,
        },
      },
      { new: true },
    ).lean<LeanAppointment>();

    if (!updated) {
      throw new ConflictError("Appointment was modified by another user");
    }

    await onAppointmentRescheduled(updated, actorUserId, previous);
    return getAppointmentDetail(String(updated._id));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ConflictError(
        "The selected time slot is no longer available",
      );
    }
    throw error;
  }
}

export async function getRescheduleAvailability(
  appointmentId: string,
  date: string,
): Promise<Awaited<ReturnType<typeof import("./booking-availability").getBookingAvailability>>> {
  const appointment = await loadAppointment(appointmentId);

  if (!canRescheduleAppointment(appointment.status, appointment.startsAt)) {
    throw new DomainError(
      "INVALID_TRANSITION",
      "This appointment cannot be rescheduled",
    );
  }

  const { getBookingAvailability } = await import("./booking-availability");
  return getBookingAvailability(date, {
    excludeAppointmentId: String(appointment._id),
  });
}
