import "server-only";

import mongoose, { Types } from "mongoose";

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
import type { LeanDoctor } from "@/models/doctor";
import type { PublicBookingInput } from "@/validators/appointment-booking";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function isTransactionUnsupportedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("transaction numbers are only allowed") ||
    message.includes("transactions are not supported") ||
    message.includes("replica set")
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

async function createAppointmentDocument(
  input: PublicBookingInput,
  doctor: LeanDoctor,
  bookingReference: string,
  occupancyKey: string,
  startsAt: Date,
  endsAt: Date,
  session?: mongoose.ClientSession,
): Promise<LeanAppointment> {
  const patient = await resolveOrCreatePatient(input, session);

  const payload = {
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
  };

  if (session) {
    const [appointment] = await Appointment.create([payload], { session });
    return appointment!.toObject() as LeanAppointment;
  }

  const appointment = await Appointment.create(payload);
  return appointment.toObject() as LeanAppointment;
}

/**
 * Creates a public guest booking with idempotency and atomic occupancy.
 * Validates availability before mutating patient charts; patient + appointment
 * writes share one MongoDB transaction when the deployment supports it.
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

  const doctor = await resolveDefaultDoctor();
  const startsAt = new Date(input.startAt);
  const endsAt = new Date(input.endAt);

  const { label, timezone } = await assertSlotAvailableForBooking({
    date: input.date,
    startAt: startsAt,
    endAt: endsAt,
  });

  const occupancyKey = buildOccupancyKey(String(doctor._id), startsAt);

  try {
    let lean: LeanAppointment | null = null;
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        lean = await createAppointmentDocument(
          input,
          doctor,
          bookingReference,
          occupancyKey,
          startsAt,
          endsAt,
          session,
        );
      });
    } catch (error) {
      if (!isTransactionUnsupportedError(error)) {
        throw error;
      }

      lean = await createAppointmentDocument(
        input,
        doctor,
        bookingReference,
        occupancyKey,
        startsAt,
        endsAt,
      );
    } finally {
      await session.endSession();
    }

    if (!lean) {
      throw new ConflictError("Unable to create appointment");
    }

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
