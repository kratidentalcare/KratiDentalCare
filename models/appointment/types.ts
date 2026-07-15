import type { Model, Types } from "mongoose";

import type { AppointmentStatus } from "@/constants/statuses";
import type {
  LeanSoftDeleteDocument,
  SoftDeleteDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Denormalized patient fields at booking time (stable history / list UI).
 */
export type AppointmentPatientSnapshot = {
  fullName: string;
  phone: string;
  email: string;
};

/**
 * Denormalized doctor fields at booking time.
 */
export type AppointmentDoctorSnapshot = {
  fullName: string;
  specialties: string[];
};

/**
 * Visit aggregation-root fields.
 *
 * @see docs/database-architecture.md §3.5
 * @see docs/api/02-appointments.md (lifecycle)
 */
export type AppointmentFields = {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  /** 1:1 with slots — unique. */
  slotId: Types.ObjectId;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledByUserId: Types.ObjectId | null;
  bookedByUserId: Types.ObjectId;
  /** Snapshot of slot.startAt at booking (immutable visit time). */
  startsAt: Date;
  /** Snapshot of slot.endAt at booking. */
  endsAt: Date;
  checkedInAt: Date | null;
  completedAt: Date | null;
  patientSnapshot: AppointmentPatientSnapshot;
  doctorSnapshot: AppointmentDoctorSnapshot;
};

export type AppointmentDocument = SoftDeleteDocument & AppointmentFields;

export type LeanAppointment = LeanSoftDeleteDocument & AppointmentFields;

export type AppointmentModel = Model<
  AppointmentDocument,
  SoftDeleteQueryHelpers
>;
