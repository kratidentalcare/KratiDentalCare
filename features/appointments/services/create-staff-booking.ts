import "server-only";

import mongoose, { Types } from "mongoose";

import {
  BOOKING_SOURCES,
  STAFF_ACTIVE_BOOKING_CONFIRMATION_MESSAGE,
} from "@/constants/appointments";
import { ERROR_CODES } from "@/constants/error-codes";
import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { findBlockingAppointmentForPatient } from "@/features/appointments/lib/booking-hold";
import { classifyBookingDuplicateKey } from "@/features/appointments/lib/duplicate-key";
import {
  buildActivePatientHold,
  buildOccupancyKey,
} from "@/features/appointments/lib/occupancy";
import { assertSlotAvailableForStaffBooking } from "@/features/appointments/services/booking-availability";
import { getDoctorByIdOrThrow } from "@/features/appointments/services/default-doctor";
import { getAppointmentDetail } from "@/features/appointments/services/list-appointments";
import { onStaffAppointmentCreated } from "@/features/appointments/services/notification-events";
import type { AppointmentDetail } from "@/features/appointments/types";
import { writeAuditLog } from "@/features/users/services/write-audit-log";
import { connect } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { AUDIT_ACTIONS } from "@/models/audit-log";
import { Appointment, type LeanAppointment } from "@/models/appointment";
import { findPatientByIdOrThrow } from "@/features/patients/repositories/patient-repository";
import type { StaffBookingInput } from "@/validators/appointment-booking";

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

export async function getPatientActiveBookingHold(patientId: string): Promise<{
  hasBlockingAppointment: boolean;
}> {
  await connect();
  const patient = await findPatientByIdOrThrow(patientId);
  const blocking = await findBlockingAppointmentForPatient({
    patientId,
    email: patient.email,
    phone: patient.phone,
  });
  return { hasBlockingAppointment: Boolean(blocking) };
}

async function insertStaffAppointment(input: {
  patient: Awaited<ReturnType<typeof findPatientByIdOrThrow>>;
  doctor: Awaited<ReturnType<typeof getDoctorByIdOrThrow>>;
  bookingInput: StaffBookingInput;
  occupancyKey: string;
  activePatientHold: string | null;
  actorUserId: string;
  startsAt: Date;
  endsAt: Date;
  session?: mongoose.ClientSession;
}): Promise<LeanAppointment> {
  const payload = {
    patientId: input.patient._id,
    doctorId: input.doctor._id,
    slotId: null,
    status: APPOINTMENT_STATUSES.CONFIRMED,
    reason: input.bookingInput.reason.trim(),
    notes: input.bookingInput.notes?.trim() || null,
    cancellationReason: null,
    cancelledAt: null,
    cancelledByUserId: null,
    bookedByUserId: new Types.ObjectId(input.actorUserId),
    bookingSource: BOOKING_SOURCES.STAFF,
    bookingReference: `staff_${crypto.randomUUID().replace(/-/g, "")}`,
    occupancyKey: input.occupancyKey,
    activePatientHold: input.activePatientHold,
    rescheduledFromStartsAt: null,
    rescheduledFromEndsAt: null,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    checkedInAt: null,
    completedAt: null,
    patientSnapshot: {
      fullName: input.patient.fullName,
      phone: input.patient.phone,
      email: input.patient.email ?? "",
    },
    doctorSnapshot: {
      fullName: input.doctor.fullName,
      specialties: input.doctor.specialties,
    },
  };

  if (input.session) {
    const [appointment] = await Appointment.create([payload], {
      session: input.session,
    });
    return appointment!.toObject() as LeanAppointment;
  }

  const appointment = await Appointment.create(payload);
  return appointment.toObject() as LeanAppointment;
}

export async function createStaffBooking(
  input: StaffBookingInput,
  actorUserId: string,
): Promise<AppointmentDetail> {
  await connect();

  const patient = await findPatientByIdOrThrow(input.patientId);
  const doctor = await getDoctorByIdOrThrow(input.doctorId);
  const startsAt = new Date(input.startAt);
  const endsAt = new Date(input.endAt);

  await assertSlotAvailableForStaffBooking({
    date: input.date,
    doctorId: input.doctorId,
    startAt: startsAt,
    endAt: endsAt,
  });

  const blocking = await findBlockingAppointmentForPatient({
    patientId: input.patientId,
    email: patient.email,
    phone: patient.phone,
  });
  const overrideUsed = Boolean(input.confirmMultipleActiveAppointments);

  if (blocking && !overrideUsed) {
    throw new ConflictError(
      STAFF_ACTIVE_BOOKING_CONFIRMATION_MESSAGE,
      ERROR_CODES.ACTIVE_BOOKING_CONFIRMATION_REQUIRED,
    );
  }

  const occupancyKey = buildOccupancyKey(String(doctor._id), startsAt);
  const activePatientHold = overrideUsed
    ? null
    : buildActivePatientHold(patient._id);

  try {
    let lean: LeanAppointment | null = null;
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const innerBlocking = await findBlockingAppointmentForPatient(
          {
            patientId: input.patientId,
            email: patient.email,
            phone: patient.phone,
          },
          session,
        );
        if (innerBlocking && !overrideUsed) {
          throw new ConflictError(
            STAFF_ACTIVE_BOOKING_CONFIRMATION_MESSAGE,
            ERROR_CODES.ACTIVE_BOOKING_CONFIRMATION_REQUIRED,
          );
        }

        lean = await insertStaffAppointment({
          patient,
          doctor,
          bookingInput: input,
          occupancyKey,
          activePatientHold,
          actorUserId,
          startsAt,
          endsAt,
          session,
        });
      });
    } catch (error) {
      if (!isTransactionUnsupportedError(error)) {
        throw error;
      }
      lean = await insertStaffAppointment({
        patient,
        doctor,
        bookingInput: input,
        occupancyKey,
        activePatientHold,
        actorUserId,
        startsAt,
        endsAt,
      });
    } finally {
      await session.endSession();
    }

    if (!lean) {
      throw new ConflictError("Unable to create appointment");
    }

    const created: LeanAppointment = lean;

    if (overrideUsed) {
      logger.info("staff_multiple_active_appointment_override", {
        patientId: input.patientId,
        appointmentId: String(created._id),
        actorUserId,
      });
    }

    await writeAuditLog({
      action: AUDIT_ACTIONS.STAFF_APPOINTMENT_CREATED,
      targetUserId: actorUserId,
      performedByUserId: actorUserId,
      patientId: input.patientId,
      resourceId: String(created._id),
      after: {
        type: "appointment",
        hadActiveAppointment: Boolean(blocking),
        overrideUsed,
        existingAppointmentId: blocking ? String(blocking._id) : undefined,
      },
    });

    await onStaffAppointmentCreated(created, actorUserId);
    return getAppointmentDetail(String(created._id));
  } catch (error) {
    const kind = classifyBookingDuplicateKey(error);
    if (kind === "slot") {
      throw new ConflictError(
        "This time slot was just booked by another patient",
      );
    }
    if (kind === "active-patient") {
      throw new ConflictError(
        STAFF_ACTIVE_BOOKING_CONFIRMATION_MESSAGE,
        ERROR_CODES.ACTIVE_BOOKING_CONFIRMATION_REQUIRED,
      );
    }
    throw error;
  }
}
