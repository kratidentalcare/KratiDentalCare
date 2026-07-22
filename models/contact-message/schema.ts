import "server-only";

import type { SchemaDefinition } from "mongoose";

import {
  CONTACT_MESSAGE_STATUSES,
  CONTACT_MESSAGE_STATUS_VALUES,
} from "@/constants/statuses";
import { createBaseSchema } from "@/models/base";

export const CONTACT_MESSAGE_MODEL_NAME = "ContactMessage";

const NAME_MAX = 120;
const EMAIL_MAX = 320;
const PHONE_MAX = 20;
const SUBJECT_MAX = 160;
const MESSAGE_MAX = 5000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]+$/;

/**
 * Public contact form inbox schema.
 * Collection: `contact_messages`
 */
export const contactMessageSchema = createBaseSchema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: [NAME_MAX, "name is too long"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      maxlength: [EMAIL_MAX, "email is too long"],
      validate: {
        validator(value: string) {
          return EMAIL_PATTERN.test(value);
        },
        message: "email must be a valid email address",
      },
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
      trim: true,
      maxlength: [PHONE_MAX, "phone is too long"],
      validate: {
        validator(value: string) {
          return value.length >= 7 && PHONE_PATTERN.test(value);
        },
        message: "phone must be a valid phone number",
      },
    },
    subject: {
      type: String,
      required: [true, "subject is required"],
      trim: true,
      maxlength: [SUBJECT_MAX, "subject is too long"],
    },
    message: {
      type: String,
      required: [true, "message is required"],
      trim: true,
      maxlength: [MESSAGE_MAX, "message is too long"],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [...CONTACT_MESSAGE_STATUS_VALUES],
        message: "`{VALUE}` is not a supported contact message status",
      },
      default: CONTACT_MESSAGE_STATUSES.NEW,
      index: true,
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: false,
    collection: "contact_messages",
  },
);

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1, createdAt: -1 });
