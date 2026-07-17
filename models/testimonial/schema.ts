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
import { USER_MODEL_NAME } from "@/models/user/constants";

export const TESTIMONIAL_MODEL_NAME = "Testimonial";

const AUTHOR_NAME_MAX = 120;
const QUOTE_MAX = 2000;

/**
 * Website testimonial CMS schema.
 * Collection: `testimonials`
 */
export const testimonialSchema = createBaseSchema(
  {
    authorName: {
      type: String,
      required: [true, "authorName is required"],
      trim: true,
      maxlength: [AUTHOR_NAME_MAX, "authorName is too long"],
    },
    quote: {
      type: String,
      required: [true, "quote is required"],
      trim: true,
      maxlength: [QUOTE_MAX, "quote is too long"],
    },
    rating: {
      type: Number,
      default: null,
      min: [1, "rating must be between 1 and 5"],
      max: [5, "rating must be between 1 and 5"],
      validate: {
        validator(value: number | null) {
          if (value == null) {
            return true;
          }
          return Number.isInteger(value);
        },
        message: "rating must be an integer",
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
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: true,
    collection: "testimonials",
  },
);

testimonialSchema.index({ status: 1, displayOrder: 1 });
testimonialSchema.index({ isActive: 1, status: 1, displayOrder: 1 });
testimonialSchema.index({ rating: 1, status: 1 });
testimonialSchema.index({ updatedByUserId: 1, updatedAt: -1 });
