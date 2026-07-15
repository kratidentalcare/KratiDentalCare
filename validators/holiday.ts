import { z } from "zod";

import {
  isActiveSchema,
  nonEmptyStringSchema,
  objectIdSchema,
} from "@/validators/common";

/**
 * Zod contracts for Holiday calendar rules (persistence boundary).
 * Not an API surface — Server Actions will reuse these later.
 */

/** Civil date as ISO date-time or Date; normalized to UTC midnight in the model. */
export const holidayDateSchema = z.coerce.date({
  message: "date must be a valid date",
});

export const createHolidaySchema = z.object({
  date: holidayDateSchema,
  reason: nonEmptyStringSchema.max(200),
  isRecurring: z.boolean().default(false),
  createdBy: objectIdSchema,
  isActive: isActiveSchema.optional(),
});

export const updateHolidaySchema = z
  .object({
    date: holidayDateSchema.optional(),
    reason: nonEmptyStringSchema.max(200).optional(),
    isRecurring: z.boolean().optional(),
    isActive: isActiveSchema.optional(),
  })
  .strict();

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;
