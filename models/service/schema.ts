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

export const SERVICE_MODEL_NAME = "Service";

const NAME_MAX = 120;
const SLUG_MAX = 120;
const SUMMARY_MAX = 300;
const DESCRIPTION_MAX = 10_000;
const ICON_MAX = 2048;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

/**
 * Website dental service CMS schema.
 * Collection: `services`
 */
export const serviceSchema = createBaseSchema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: [NAME_MAX, "name is too long"],
    },
    slug: {
      type: String,
      required: [true, "slug is required"],
      trim: true,
      lowercase: true,
      maxlength: [SLUG_MAX, "slug is too long"],
      validate: {
        validator(value: string) {
          return SLUG_PATTERN.test(value);
        },
        message: "slug must be lowercase kebab-case",
      },
    },
    summary: {
      type: String,
      required: [true, "summary is required"],
      trim: true,
      maxlength: [SUMMARY_MAX, "summary is too long"],
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: [DESCRIPTION_MAX, "description is too long"],
      set: emptyToNull,
    },
    icon: {
      type: String,
      default: null,
      trim: true,
      maxlength: [ICON_MAX, "icon is too long"],
      set: emptyToNull,
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
    collection: "services",
  },
);

serviceSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

serviceSchema.index({ status: 1, displayOrder: 1 });
serviceSchema.index({ isActive: 1, status: 1, displayOrder: 1 });
serviceSchema.index({ updatedByUserId: 1, updatedAt: -1 });
