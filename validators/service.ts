import { z } from "zod";

import { CONTENT_STATUSES } from "@/constants/statuses";
import {
  contentStatusSchema,
  isActiveSchema,
  nonEmptyStringSchema,
  objectIdSchema,
} from "@/validators/common";

/**
 * Zod contracts for website Service CMS rows (persistence boundary).
 */

export const serviceSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case")
  .max(120);

export const createServiceSchema = z.object({
  name: nonEmptyStringSchema.max(120),
  slug: serviceSlugSchema,
  summary: nonEmptyStringSchema.max(300),
  description: z.string().trim().max(10_000).nullable().optional(),
  icon: z.string().trim().max(2048).nullable().optional(),
  displayOrder: z.number().int().min(0).default(0),
  status: contentStatusSchema.default(CONTENT_STATUSES.DRAFT),
  isActive: isActiveSchema.optional(),
  updatedByUserId: objectIdSchema,
});

export const updateServiceSchema = z
  .object({
    name: nonEmptyStringSchema.max(120).optional(),
    slug: serviceSlugSchema.optional(),
    summary: nonEmptyStringSchema.max(300).optional(),
    description: z.string().trim().max(10_000).nullable().optional(),
    icon: z.string().trim().max(2048).nullable().optional(),
    displayOrder: z.number().int().min(0).optional(),
    status: contentStatusSchema.optional(),
    isActive: isActiveSchema.optional(),
    updatedByUserId: objectIdSchema.optional(),
  })
  .strict();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
