import "server-only";

import { getOrCreateModel } from "@/models/base";

import { TESTIMONIAL_MODEL_NAME, testimonialSchema } from "./schema";
import type { TestimonialDocument, TestimonialModel } from "./types";

/**
 * Testimonial (CMS) model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Testimonial = getOrCreateModel<TestimonialDocument>(
  TESTIMONIAL_MODEL_NAME,
  testimonialSchema,
) as TestimonialModel;

export type {
  LeanTestimonial,
  TestimonialDocument,
  TestimonialFields,
  TestimonialModel,
} from "./types";
export { TESTIMONIAL_MODEL_NAME, testimonialSchema } from "./schema";
