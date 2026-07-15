import { z } from "zod";

import { CONTENT_STATUSES } from "@/constants/statuses";
import {
  contentStatusSchema,
  isActiveSchema,
  nonEmptyStringSchema,
  objectIdSchema,
} from "@/validators/common";

/**
 * Zod contracts for website Testimonial CMS rows (persistence boundary).
 */

export const testimonialRatingSchema = z
  .number()
  .int()
  .min(1)
  .max(5)
  .nullable();

export const createTestimonialSchema = z.object({
  authorName: nonEmptyStringSchema.max(120),
  quote: nonEmptyStringSchema.max(2000),
  rating: testimonialRatingSchema.optional(),
  displayOrder: z.number().int().min(0).default(0),
  status: contentStatusSchema.default(CONTENT_STATUSES.DRAFT),
  isActive: isActiveSchema.optional(),
  updatedByUserId: objectIdSchema,
});

export const updateTestimonialSchema = z
  .object({
    authorName: nonEmptyStringSchema.max(120).optional(),
    quote: nonEmptyStringSchema.max(2000).optional(),
    rating: testimonialRatingSchema.optional(),
    displayOrder: z.number().int().min(0).optional(),
    status: contentStatusSchema.optional(),
    isActive: isActiveSchema.optional(),
    updatedByUserId: objectIdSchema.optional(),
  })
  .strict();

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
