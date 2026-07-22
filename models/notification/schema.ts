import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  NOTIFICATION_TYPE_VALUES,
} from "@/constants/notifications";
import { createBaseSchema } from "@/models/base";

export const NOTIFICATION_MODEL_NAME = "Notification";

const TITLE_MAX = 160;
const DESCRIPTION_MAX = 500;
const HREF_MAX = 500;
const EVENT_MAX = 80;
const ENTITY_TYPE_MAX = 64;
const IDEMPOTENCY_MAX = 200;

/**
 * In-app Notification Center schema.
 * Collection: `notifications`
 *
 * Distinct from `notification_outbox` (outbound email / WhatsApp intents).
 */
export const notificationSchema = createBaseSchema(
  {
    type: {
      type: String,
      required: [true, "type is required"],
      enum: {
        values: [...NOTIFICATION_TYPE_VALUES],
        message: "`{VALUE}` is not a supported notification type",
      },
      index: true,
    },
    event: {
      type: String,
      required: [true, "event is required"],
      trim: true,
      maxlength: [EVENT_MAX, "event is too long"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      maxlength: [TITLE_MAX, "title is too long"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
      maxlength: [DESCRIPTION_MAX, "description is too long"],
    },
    href: {
      type: String,
      default: null,
      trim: true,
      maxlength: [HREF_MAX, "href is too long"],
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    relatedEntityType: {
      type: String,
      default: null,
      trim: true,
      maxlength: [ENTITY_TYPE_MAX, "relatedEntityType is too long"],
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    idempotencyKey: {
      type: String,
      default: null,
      trim: true,
      maxlength: [IDEMPOTENCY_MAX, "idempotencyKey is too long"],
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: false,
    collection: "notifications",
  },
);

notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: "string" },
    },
  },
);
