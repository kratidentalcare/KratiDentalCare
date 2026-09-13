import "server-only";

import type { SchemaDefinition } from "mongoose";

import { createBaseSchema } from "@/models/base";

import { RATE_LIMIT_HIT_MODEL_NAME } from "./constants";

const KEY_MAX = 320;

export const rateLimitHitSchema = createBaseSchema(
  {
    key: {
      type: String,
      required: [true, "key is required"],
      trim: true,
      maxlength: [KEY_MAX, "key is too long"],
    },
    windowStart: {
      type: Date,
      required: [true, "windowStart is required"],
    },
    count: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    expiresAt: {
      type: Date,
      required: [true, "expiresAt is required"],
    },
  } as SchemaDefinition,
  {
    softDelete: false,
    isActive: false,
    collection: "rate_limit_hits",
  },
);

rateLimitHitSchema.index({ key: 1, windowStart: 1 }, { unique: true });
rateLimitHitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export { RATE_LIMIT_HIT_MODEL_NAME };
