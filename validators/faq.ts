import { z } from "zod";

import { CONTENT_STATUSES } from "@/constants/statuses";
import {
  contentStatusSchema,
  isActiveSchema,
  nonEmptyStringSchema,
  objectIdSchema,
} from "@/validators/common";

/**
 * Zod contracts for website FAQ CMS rows (persistence boundary).
 */

export const faqCategorySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "category must be lowercase kebab-case")
  .max(64)
  .nullable();

export const createFaqSchema = z.object({
  question: nonEmptyStringSchema.max(300),
  answer: nonEmptyStringSchema.max(10_000),
  category: faqCategorySchema.optional(),
  displayOrder: z.number().int().min(0).default(0),
  status: contentStatusSchema.default(CONTENT_STATUSES.DRAFT),
  isActive: isActiveSchema.optional(),
  updatedByUserId: objectIdSchema,
});

export const updateFaqSchema = z
  .object({
    question: nonEmptyStringSchema.max(300).optional(),
    answer: nonEmptyStringSchema.max(10_000).optional(),
    category: faqCategorySchema.optional(),
    displayOrder: z.number().int().min(0).optional(),
    status: contentStatusSchema.optional(),
    isActive: isActiveSchema.optional(),
    updatedByUserId: objectIdSchema.optional(),
  })
  .strict();

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
