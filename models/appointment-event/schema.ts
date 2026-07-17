import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  APPOINTMENT_EVENT_TYPE_VALUES,
} from "@/constants/appointments";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { APPOINTMENT_MODEL_NAME } from "@/models/appointment/schema";
import { USER_MODEL_NAME } from "@/models/user/constants";

const PAYLOAD_MAX_BYTES = 16_384;

export const APPOINTMENT_EVENT_MODEL_NAME = "AppointmentEvent";

/**
 * Append-only appointment lifecycle audit trail.
 * Collection: `appointment_events`
 */
export const appointmentEventSchema = createBaseSchema(
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
    eventType: {
      type: String,
      required: true,
      enum: {
        values: [...APPOINTMENT_EVENT_TYPE_VALUES],
        message: "`{VALUE}` is not a supported appointment event type",
      },
    },
    actorUserId: {
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
  } as SchemaDefinition,
  {
    softDelete: false,
    isActive: false,
    collection: "appointment_events",
  },
);

appointmentEventSchema.index({ appointmentId: 1, createdAt: -1 });
appointmentEventSchema.index({ eventType: 1, createdAt: -1 });
