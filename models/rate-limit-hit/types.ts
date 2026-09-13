import type { Model } from "mongoose";

import type { BaseDocument, LeanBaseDocument } from "@/models/base";

export type RateLimitHitFields = {
  key: string;
  windowStart: Date;
  count: number;
  expiresAt: Date;
};

export type RateLimitHitDocument = BaseDocument & RateLimitHitFields;

export type LeanRateLimitHit = LeanBaseDocument & RateLimitHitFields;

export type RateLimitHitModel = Model<RateLimitHitDocument>;
