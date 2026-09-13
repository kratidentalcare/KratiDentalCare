import "server-only";

import { getOrCreateModel } from "@/models/base";

import { RATE_LIMIT_HIT_MODEL_NAME, rateLimitHitSchema } from "./schema";
import type { RateLimitHitDocument, RateLimitHitModel } from "./types";

export const RateLimitHit = getOrCreateModel<RateLimitHitDocument>(
  RATE_LIMIT_HIT_MODEL_NAME,
  rateLimitHitSchema,
) as RateLimitHitModel;

export type {
  LeanRateLimitHit,
  RateLimitHitDocument,
  RateLimitHitFields,
  RateLimitHitModel,
} from "./types";
export { RATE_LIMIT_HIT_MODEL_NAME, rateLimitHitSchema } from "./schema";
