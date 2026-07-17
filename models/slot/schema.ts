import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  SLOT_STATUSES,
  SLOT_STATUS_VALUES,
} from "@/constants/statuses";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { DOCTOR_MODEL_NAME } from "@/models/doctor";
import { USER_MODEL_NAME } from "@/models/user/constants";

/** Forward ref — Appointment model is implemented in a later phase. */
export const APPOINTMENT_MODEL_NAME = "Appointment";

const NOTES_MAX = 1000;
/** Soft lower bound so accidental zero/negative windows fail early. */
const MIN_DURATION_MS = 5 * 60 * 1000;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

/**
 * Slot inventory schema.
 * Collection: `slots`
 */
export const slotSchema = createBaseSchema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: DOCTOR_MODEL_NAME,
      required: [true, "doctorId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    startAt: {
      type: Date,
      required: [true, "startAt is required"],
    },
    endAt: {
      type: Date,
      required: [true, "endAt is required"],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [...SLOT_STATUS_VALUES],
        message: "`{VALUE}` is not a supported slot status",
      },
      default: SLOT_STATUSES.AVAILABLE,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: APPOINTMENT_MODEL_NAME,
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
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: [true, "createdByUserId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: [NOTES_MAX, "notes is too long"],
      set: emptyToNull,
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: false,
    collection: "slots",
  },
);

slotSchema.pre("validate", function validateWindowAndBookingLink() {
  const startAt = this.get("startAt") as Date | undefined;
  const endAt = this.get("endAt") as Date | undefined;
  const status = this.get("status") as string | undefined;
  const appointmentId = this.get("appointmentId") as unknown;

  if (
    startAt instanceof Date &&
    endAt instanceof Date &&
    !Number.isNaN(startAt.getTime()) &&
    !Number.isNaN(endAt.getTime())
  ) {
    if (endAt.getTime() <= startAt.getTime()) {
      this.invalidate("endAt", "endAt must be after startAt");
    } else if (endAt.getTime() - startAt.getTime() < MIN_DURATION_MS) {
      this.invalidate(
        "endAt",
        "slot duration must be at least 5 minutes",
      );
    }
  }

  if (status === SLOT_STATUSES.BOOKED && appointmentId == null) {
    this.invalidate(
      "appointmentId",
      "appointmentId is required when status is BOOKED",
    );
  }

  if (
    status !== SLOT_STATUSES.BOOKED &&
    appointmentId != null &&
    status != null
  ) {
    this.invalidate(
      "appointmentId",
      "appointmentId must be null unless status is BOOKED",
    );
  }
});

// Prevent overlapping duplicate windows for the same doctor start time.
slotSchema.index(
  { doctorId: 1, startAt: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

// Availability / board queries: doctor + status ordered by start.
slotSchema.index({ doctorId: 1, status: 1, startAt: 1 });

// Range scans / cleanup jobs.
slotSchema.index({ startAt: 1, endAt: 1 });

// 1:1 link to appointment when booked.
slotSchema.index(
  { appointmentId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { appointmentId: { $type: "objectId" } },
  },
);

slotSchema.index({ createdByUserId: 1, createdAt: -1 });
slotSchema.index({ status: 1, startAt: 1 });
