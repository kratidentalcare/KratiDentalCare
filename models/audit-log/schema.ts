import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { PATIENT_MODEL_NAME } from "@/models/patient";
import { USER_MODEL_NAME } from "@/models/user/constants";

import { AUDIT_ACTION_VALUES } from "./actions";
import { AUDIT_LOG_MODEL_NAME } from "./constants";

const NOTE_MAX_LENGTH = 500;

/**
 * Lightweight internal audit trail for privileged mutations.
 * Collection: `audit_logs`
 */
export const auditLogSchema = createBaseSchema(
  {
    action: {
      type: String,
      required: [true, "action is required"],
      enum: {
        values: [...AUDIT_ACTION_VALUES],
        message: "`{VALUE}` is not a supported audit action",
      },
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: [true, "targetUserId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    performedByUserId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: [true, "performedByUserId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: PATIENT_MODEL_NAME,
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
    resourceId: {
      type: Schema.Types.ObjectId,
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
    before: {
      type: Schema.Types.Mixed,
      default: null,
    },
    after: {
      type: Schema.Types.Mixed,
      default: null,
    },
    note: {
      type: String,
      default: null,
      trim: true,
      maxlength: [NOTE_MAX_LENGTH, "note is too long"],
      set: (value: string | null) => (value === "" ? null : value),
    },
  } as SchemaDefinition,
  {
    softDelete: false,
    isActive: false,
    collection: "audit_logs",
  },
);

auditLogSchema.index({ targetUserId: 1, createdAt: -1 });
auditLogSchema.index({ performedByUserId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ patientId: 1, createdAt: -1 });

export { AUDIT_LOG_MODEL_NAME };
