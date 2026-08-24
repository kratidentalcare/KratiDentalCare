import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import { APPOINTMENT_EMAIL_ACTION_VALUES } from "@/constants/email";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { APPOINTMENT_MODEL_NAME } from "@/models/appointment/schema";

const TOKEN_HASH_MAX = 128;
const BUNDLE_ID_MAX = 64;

export const APPOINTMENT_ACTION_TOKEN_MODEL_NAME = "AppointmentActionToken";

/**
 * Single-use expiring tokens for admin email appointment actions.
 * Collection: `appointment_action_tokens`
 */
export const appointmentActionTokenSchema = createBaseSchema(
  {
    tokenHash: {
      type: String,
      required: [true, "tokenHash is required"],
      trim: true,
      maxlength: [TOKEN_HASH_MAX, "tokenHash is too long"],
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: APPOINTMENT_MODEL_NAME,
      required: [true, "appointmentId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    action: {
      type: String,
      required: true,
      enum: {
        values: [...APPOINTMENT_EMAIL_ACTION_VALUES],
        message: "`{VALUE}` is not a supported appointment email action",
      },
    },
    bundleId: {
      type: String,
      required: [true, "bundleId is required"],
      trim: true,
      maxlength: [BUNDLE_ID_MAX, "bundleId is too long"],
    },
    expiresAt: {
      type: Date,
      required: [true, "expiresAt is required"],
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    consumedByAction: {
      type: String,
      default: null,
      trim: true,
      validate: {
        validator(value: unknown) {
          if (value == null) {
            return true;
          }
          return (APPOINTMENT_EMAIL_ACTION_VALUES as readonly string[]).includes(
            String(value),
          );
        },
        message: "`{VALUE}` is not a supported appointment email action",
      },
    },
  } as SchemaDefinition,
  {
    softDelete: false,
    isActive: false,
    collection: "appointment_action_tokens",
  },
);

appointmentActionTokenSchema.index({ tokenHash: 1 }, { unique: true });
appointmentActionTokenSchema.index({ appointmentId: 1, bundleId: 1 });
appointmentActionTokenSchema.index({ expiresAt: 1 });
