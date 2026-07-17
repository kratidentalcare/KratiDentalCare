import "server-only";

import { Types } from "mongoose";

import { BOOKING_SOURCES } from "@/constants/appointments";
import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { buildOccupancyKey } from "@/features/appointments/lib/occupancy";
import { assertSlotAvailableForBooking } from "@/features/appointments/services/booking-availability";
import { onAppointmentCreated } from "@/features/appointments/services/notification-events";
import { resolveDefaultDoctor } from "@/features/appointments/services/default-doctor";
import { resolveOrCreatePatient } from "@/features/appointments/services/patient-resolution";
import type { PublicBookingConfirmation } from "@/features/appointments/types";
import { connect } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { Appointment, type LeanAppointment } from "@/models/appointment";
import type { PublicBookingInput } from "@/validators/appointment-booking";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function toConfirmation(
  appointment: LeanAppointment,
  label: string,
  timezone: string,
  reference: string,
): PublicBookingConfirmation {
  return {
    reference,
    status: appointment.status,
    date: appointment.startsAt.toISOString().slice(0, 10),
    startAt: appointment.startsAt.toISOString(),
    endAt: appointment.endsAt.toISOString(),
    label,
    timezone,
    patientName: appointment.patientSnapshot.fullName,
  };
}

/**
 * Creates a public guest booking with idempotency and atomic occupancy.
 */
export async function createPublicBooking(
  input: PublicBookingInput,
): Promise<PublicBookingConfirmation> {
  await connect();

  const bookingReference =
    input.bookingReference ?? `pub_${crypto.randomUUID().replace(/-/g, "")}`;

  const existing = await Appointment.findOne({
    bookingReference,
    deletedAt: null,
  }).lean<LeanAppointment>();

  if (existing) {
    const { label, timezone } = await assertSlotAvailableForBooking({
      date: input.date,
      startAt: existing.startsAt,
      endAt: existing.endsAt,
    }).catch(() => ({
      label: existing.startsAt.toISOString(),
      timezone: "UTC",
    }));

    return toConfirmation(existing, label, timezone, bookingReference);
  }

  const [doctor, patient] = await Promise.all([
    resolveDefaultDoctor(),
    resolveOrCreatePatient(input),
  ]);

  const startsAt = new Date(input.startAt);
  const endsAt = new Date(input.endAt);

  const { label, timezone } = await assertSlotAvailableForBooking({
    date: input.date,
    startAt: startsAt,
    endsAt,
  });

  const occupancyKey = buildOccupancyKey(String(doctor._id), startsAt);

  try {
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      slotId: null,
      status: APPOINTMENT_STATUSES.PENDING,
      reason: input.reason.trim(),
      notes: null,
      cancellationReason: null,
      cancelledAt: null,
      cancelledByUserId: null,
      bookedByUserId: null,
      bookingSource: BOOKING_SOURCES.PUBLIC,
      bookingReference,
      occupancyKey,
      rescheduledFromStartsAt: null,
      rescheduledFromEndsAt: null,
      startsAt,
      endsAt,
      checkedInAt: null,
      completedAt: null,
      patientSnapshot: {
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
      },
      doctorSnapshot: {
        fullName: doctor.fullName,
        specialties: doctor.specialties,
      },
    });

    const lean = appointment.toObject() as LeanAppointment;
    await onAppointmentCreated(lean);

    return toConfirmation(lean, label, timezone, bookingReference);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const raced = await Appointment.findOne({
        $or: [{ bookingReference }, { occupancyKey }],
        deletedAt: null,
      }).lean<LeanAppointment>();

      if (raced) {
        if (raced.bookingReference === bookingReference) {
          return toConfirmation(raced, label, timezone, bookingReference);
        }
        throw new ConflictError(
          "This time slot was just booked by another patient",
        );
      }
    }

    throw error;
  }
}

export async function getAppointmentByIdOrThrow(
  id: string,
): Promise<LeanAppointment> {
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
