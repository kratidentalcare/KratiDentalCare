import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_VALUES,
} from "@/constants/statuses";
import {
  BOOKING_SOURCE_VALUES,
  BOOKING_SOURCES,
} from "@/constants/appointments";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { DOCTOR_MODEL_NAME } from "@/models/doctor";
import { PATIENT_MODEL_NAME } from "@/models/patient";
import { APPOINTMENT_MODEL_NAME, SLOT_MODEL_NAME } from "@/models/slot";
import { USER_MODEL_NAME } from "@/models/user/constants";

const REASON_MAX = 500;
const NOTES_MAX = 5000;
const CANCEL_REASON_MAX = 500;
const SNAPSHOT_NAME_MAX = 120;
const SNAPSHOT_PHONE_MAX = 20;
const SNAPSHOT_EMAIL_MAX = 320;
const SPECIALTY_MAX = 80;
const MAX_SPECIALTIES = 20;
const MIN_DURATION_MS = 5 * 60 * 1000;
const BOOKING_REFERENCE_MAX = 128;
const OCCUPANCY_KEY_MAX = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]+$/;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

const patientSnapshotSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "patientSnapshot.fullName is required"],
      trim: true,
      maxlength: [SNAPSHOT_NAME_MAX, "patientSnapshot.fullName is too long"],
    },
    phone: {
      type: String,
      required: [true, "patientSnapshot.phone is required"],
      trim: true,
      maxlength: [SNAPSHOT_PHONE_MAX, "patientSnapshot.phone is too long"],
      validate: {
        validator(value: string) {
          return value.length >= 7 && PHONE_PATTERN.test(value);
        },
        message: "patientSnapshot.phone must be a valid phone number",
      },
    },
    email: {
      type: String,
      required: [true, "patientSnapshot.email is required"],
      trim: true,
      lowercase: true,
      maxlength: [SNAPSHOT_EMAIL_MAX, "patientSnapshot.email is too long"],
      validate: {
        validator(value: string) {
          // Allow empty for walk-ins without email; otherwise validate format.
          if (value === "") {
            return true;
          }
          return EMAIL_PATTERN.test(value);
        },
        message: "patientSnapshot.email must be a valid email address",
      },
    },
  },
  { _id: false },
);

const doctorSnapshotSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "doctorSnapshot.fullName is required"],
      trim: true,
      maxlength: [SNAPSHOT_NAME_MAX, "doctorSnapshot.fullName is too long"],
    },
    specialties: {
      type: [String],
      required: [true, "doctorSnapshot.specialties are required"],
      validate: {
        validator(value: string[]) {
          return (
            Array.isArray(value) &&
            value.length >= 1 &&
            value.length <= MAX_SPECIALTIES &&
            value.every(
              (item) =>
                typeof item === "string" &&
                item.trim().length > 0 &&
                item.trim().length <= SPECIALTY_MAX,
            )
          );
        },
        message: "doctorSnapshot.specialties must contain 1+ non-empty values",
      },
    },
  },
  { _id: false },
);

/**
 * Appointment (visit) schema — aggregation root for clinical visits.
 * Collection: `appointments`
 */
export const appointmentSchema = createBaseSchema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: PATIENT_MODEL_NAME,
      required: [true, "patientId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: DOCTOR_MODEL_NAME,
      required: [true, "doctorId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    /**
     * Legacy Slot inventory link (optional).
     * Runtime-generated bookings leave this null; existing Slot-linked
     * appointments remain readable for backwards compatibility.
     */
    slotId: {
      type: Schema.Types.ObjectId,
      ref: SLOT_MODEL_NAME,
      default: null,
      validate: {
        validator(value: unknown) {
          if (value == null) {
            return true;
          }
          return objectIdPathValidator(value);
        },
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [...APPOINTMENT_STATUS_VALUES],
        message: "`{VALUE}` is not a supported appointment status",
      },
      default: APPOINTMENT_STATUSES.PENDING,
    },
    reason: {
      type: String,
      default: null,
      trim: true,
      maxlength: [REASON_MAX, "reason is too long"],
      set: emptyToNull,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: [NOTES_MAX, "notes is too long"],
      set: emptyToNull,
    },
    cancellationReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: [CANCEL_REASON_MAX, "cancellationReason is too long"],
      set: emptyToNull,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledByUserId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      default: null,
      validate: {
        validator(value: unknown) {
          if (value == null) {
            return true;
          }
          return objectIdPathValidator(value);
        },
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    bookedByUserId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      default: null,
      validate: {
        validator(value: unknown) {
          if (value == null) {
            return true;
          }
          return objectIdPathValidator(value);
        },
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    bookingSource: {
      type: String,
      required: true,
      enum: {
        values: [...BOOKING_SOURCE_VALUES],
        message: "`{VALUE}` is not a supported booking source",
      },
      default: BOOKING_SOURCES.STAFF,
    },
    /** Client-supplied idempotency key for public booking retries. */
    bookingReference: {
      type: String,
      default: null,
      trim: true,
      maxlength: [BOOKING_REFERENCE_MAX, "bookingReference is too long"],
      set: emptyToNull,
    },
    /**
     * Minute-level occupancy guard for slotless bookings.
     * Set for blocking statuses; cleared on cancellation/archive.
     */
    occupancyKey: {
      type: String,
      default: null,
      trim: true,
      maxlength: [OCCUPANCY_KEY_MAX, "occupancyKey is too long"],
      set: emptyToNull,
    },
    rescheduledFromStartsAt: {
      type: Date,
      default: null,
    },
    rescheduledFromEndsAt: {
      type: Date,
      default: null,
    },
    startsAt: {
      type: Date,
      required: [true, "startsAt is required"],
    },
    endsAt: {
      type: Date,
      required: [true, "endsAt is required"],
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    patientSnapshot: {
      type: patientSnapshotSchema,
      required: [true, "patientSnapshot is required"],
    },
    doctorSnapshot: {
      type: doctorSnapshotSchema,
      required: [true, "doctorSnapshot is required"],
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: false,
    collection: "appointments",
  },
);

appointmentSchema.pre("validate", function validateAppointmentInvariants() {
  const startsAt = this.get("startsAt") as Date | undefined;
  const endsAt = this.get("endsAt") as Date | undefined;
  const status = this.get("status") as string | undefined;
  const cancelledAt = this.get("cancelledAt") as Date | null | undefined;
  const cancelledByUserId = this.get("cancelledByUserId") as unknown;
  const cancellationReason = this.get("cancellationReason") as string | null;
  const checkedInAt = this.get("checkedInAt") as Date | null | undefined;
  const completedAt = this.get("completedAt") as Date | null | undefined;

  if (
    startsAt instanceof Date &&
    endsAt instanceof Date &&
    !Number.isNaN(startsAt.getTime()) &&
    !Number.isNaN(endsAt.getTime())
  ) {
    if (endsAt.getTime() <= startsAt.getTime()) {
      this.invalidate("endsAt", "endsAt must be after startsAt");
    } else if (endsAt.getTime() - startsAt.getTime() < MIN_DURATION_MS) {
      this.invalidate("endsAt", "appointment duration must be at least 5 minutes");
    }
  }

  if (status === APPOINTMENT_STATUSES.CANCELLED) {
    if (cancelledAt == null) {
      this.invalidate("cancelledAt", "cancelledAt is required when CANCELLED");
    }
    if (cancelledByUserId == null) {
      this.invalidate(
        "cancelledByUserId",
        "cancelledByUserId is required when CANCELLED",
      );
    }
    if (this.get("occupancyKey") != null) {
      this.invalidate(
        "occupancyKey",
        "occupancyKey must be cleared when CANCELLED",
      );
    }
  }

  if (
    status !== APPOINTMENT_STATUSES.CANCELLED &&
    (cancelledAt != null ||
      cancelledByUserId != null ||
      (cancellationReason != null && cancellationReason !== ""))
  ) {
    this.invalidate(
      "cancellationReason",
      "cancellation fields are only valid when status is CANCELLED",
    );
  }

  if (
    (status === APPOINTMENT_STATUSES.CHECKED_IN ||
      status === APPOINTMENT_STATUSES.COMPLETED) &&
    checkedInAt == null
  ) {
    this.invalidate(
      "checkedInAt",
      "checkedInAt is required when CHECKED_IN or COMPLETED",
    );
  }

  if (status === APPOINTMENT_STATUSES.COMPLETED && completedAt == null) {
    this.invalidate("completedAt", "completedAt is required when COMPLETED");
  }

});

// Unique only when a legacy Slot document is linked (slotless bookings allowed).
appointmentSchema.index(
  { slotId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      deletedAt: null,
      slotId: { $type: "objectId" },
    },
  },
);

// Atomic occupancy guard — one blocking appointment per doctor-minute.
appointmentSchema.index(
  { occupancyKey: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      deletedAt: null,
      occupancyKey: { $type: "string" },
      status: { $nin: ["CANCELLED", "ARCHIVED"] },
    },
  },
);

// Idempotent public booking retries.
appointmentSchema.index(
  { bookingReference: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      deletedAt: null,
      bookingReference: { $type: "string" },
    },
  },
);

// Legacy non-unique doctor/time listing index.
appointmentSchema.index(
  { doctorId: 1, startsAt: 1, endsAt: 1 },
  {
    partialFilterExpression: {
      deletedAt: null,
      status: { $nin: ["CANCELLED", "ARCHIVED"] },
    },
  },
);

appointmentSchema.index({ patientId: 1, startsAt: -1 });
appointmentSchema.index({ doctorId: 1, startsAt: -1 });
appointmentSchema.index({ status: 1, startsAt: 1 });
appointmentSchema.index({ bookedByUserId: 1, createdAt: -1 });
appointmentSchema.index({ startsAt: 1, endsAt: 1 });
appointmentSchema.index({ cancelledByUserId: 1, cancelledAt: -1 });

export { APPOINTMENT_MODEL_NAME };
