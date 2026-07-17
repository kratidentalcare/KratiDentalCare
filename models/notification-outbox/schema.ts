import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  APPOINTMENT_EVENT_TYPE_VALUES,
  NOTIFICATION_CHANNEL_VALUES,
  NOTIFICATION_STATUS_VALUES,
  NOTIFICATION_STATUSES,
} from "@/constants/appointments";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { APPOINTMENT_MODEL_NAME } from "@/models/appointment/schema";

const IDEMPOTENCY_KEY_MAX = 200;
const PAYLOAD_MAX_BYTES = 16_384;

export const NOTIFICATION_OUTBOX_MODEL_NAME = "NotificationOutbox";

/**
 * Provider-neutral notification intent queue.
 * Collection: `notification_outbox`
 */
export const notificationOutboxSchema = createBaseSchema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: APPOINTMENT_MODEL_NAME,
      required: [true, "appointmentId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    channel: {
      type: String,
      required: true,
      enum: {
        values: [...NOTIFICATION_CHANNEL_VALUES],
        message: "`{VALUE}` is not a supported notification channel",
      },
    },
    eventType: {
      type: String,
      required: true,
      enum: {
        values: [...APPOINTMENT_EVENT_TYPE_VALUES],
        message: "`{VALUE}` is not a supported notification event type",
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [...NOTIFICATION_STATUS_VALUES],
        message: "`{VALUE}` is not a supported notification status",
      },
      default: NOTIFICATION_STATUSES.PENDING,
    },
    idempotencyKey: {
      type: String,
      required: [true, "idempotencyKey is required"],
      trim: true,
      maxlength: [IDEMPOTENCY_KEY_MAX, "idempotencyKey is too long"],
    },
    payload: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator(value: unknown) {
          if (value == null) {
            return true;
          }
          try {
            const serialized = JSON.stringify(value);
            return Buffer.byteLength(serialized, "utf8") <= PAYLOAD_MAX_BYTES;
          } catch {
            return false;
          }
        },
        message: "payload is too large or not serializable",
      },
    },
    lastError: {
      type: String,
      default: null,
      trim: true,
      maxlength: [1000, "lastError is too long"],
    },
    sentAt: {
      type: Date,
      default: null,
    },
  } as SchemaDefinition,
  {
    softDelete: false,
    isActive: false,
    collection: "notification_outbox",
  },
);

notificationOutboxSchema.index({ idempotencyKey: 1 }, { unique: true });
notificationOutboxSchema.index({ status: 1, createdAt: 1 });
notificationOutboxSchema.index({ appointmentId: 1, createdAt: -1 });
