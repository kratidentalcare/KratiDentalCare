import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  CONTENT_STATUSES,
  CONTENT_STATUS_VALUES,
} from "@/constants/statuses";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { USER_MODEL_NAME } from "@/models/user";

export const FAQ_MODEL_NAME = "Faq";

const QUESTION_MAX = 300;
const ANSWER_MAX = 10_000;
const CATEGORY_MAX = 64;

const CATEGORY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

/**
 * Website FAQ CMS schema.
 * Collection: `faqs`
 */
export const faqSchema = createBaseSchema(
  {
    question: {
      type: String,
      required: [true, "question is required"],
      trim: true,
      maxlength: [QUESTION_MAX, "question is too long"],
    },
    answer: {
      type: String,
      required: [true, "answer is required"],
      trim: true,
      maxlength: [ANSWER_MAX, "answer is too long"],
    },
    category: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      maxlength: [CATEGORY_MAX, "category is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          if (value == null) {
            return true;
          }
          return CATEGORY_PATTERN.test(value);
        },
        message: "category must be lowercase kebab-case",
      },
    },
    displayOrder: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "displayOrder cannot be negative"],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [...CONTENT_STATUS_VALUES],
        message: "`{VALUE}` is not a supported content status",
      },
      default: CONTENT_STATUSES.DRAFT,
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
  } satisfies SchemaDefinition,
  {
    softDelete: true,
    isActive: true,
    collection: "faqs",
  },
);

faqSchema.index({ status: 1, category: 1, displayOrder: 1 });
faqSchema.index({ isActive: 1, status: 1, displayOrder: 1 });
faqSchema.index({ category: 1, status: 1 });
faqSchema.index({ updatedByUserId: 1, updatedAt: -1 });
