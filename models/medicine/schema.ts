import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  MEDICINE_STATUSES,
  MEDICINE_STATUS_VALUES,
} from "@/constants/statuses";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { USER_MODEL_NAME } from "@/models/user/constants";

const NAME_MAX = 200;
const GENERIC_NAME_MAX = 200;
const FIELD_MAX = 200;
const NOTES_MAX = 2000;
const NORMALIZED_NAME_MAX = 200;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

/**
 * Medicine library catalog.
 * Collection: `medicines`
 *
 * Prescriptions store a snapshot of these defaults; catalog edits never
 * rewrite historical prescriptions.
 */
export const medicineSchema = createBaseSchema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: [NAME_MAX, "name is too long"],
    },
    genericName: {
      type: String,
      default: null,
      trim: true,
      maxlength: [GENERIC_NAME_MAX, "genericName is too long"],
      set: emptyToNull,
    },
    normalizedName: {
      type: String,
      required: [true, "normalizedName is required"],
      trim: true,
      lowercase: true,
      maxlength: [NORMALIZED_NAME_MAX, "normalizedName is too long"],
    },
    dosage: {
      type: String,
      required: [true, "dosage is required"],
      trim: true,
      maxlength: [FIELD_MAX, "dosage is too long"],
    },
    frequency: {
      type: String,
      required: [true, "frequency is required"],
      trim: true,
      maxlength: [FIELD_MAX, "frequency is too long"],
    },
    duration: {
      type: String,
      required: [true, "duration is required"],
      trim: true,
      maxlength: [FIELD_MAX, "duration is too long"],
    },
    instructions: {
      type: String,
      default: null,
      trim: true,
      maxlength: [FIELD_MAX, "instructions are too long"],
      set: emptyToNull,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: [NOTES_MAX, "notes are too long"],
      set: emptyToNull,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [...MEDICINE_STATUS_VALUES],
        message: "`{VALUE}` is not a supported medicine status",
      },
      default: MEDICINE_STATUSES.ACTIVE,
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
    updatedByUserId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: [true, "updatedByUserId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: false,
    collection: "medicines",
  },
);

medicineSchema.index({ status: 1, name: 1 });
medicineSchema.index({ status: 1, genericName: 1 });
medicineSchema.index({ normalizedName: 1, status: 1 });
medicineSchema.index({ updatedAt: -1 });
