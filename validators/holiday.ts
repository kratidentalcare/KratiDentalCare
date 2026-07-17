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

/** Admin form input — createdBy injected server-side. */
export const createHolidayActionSchema = z.object({
  /** Civil date `YYYY-MM-DD` in clinic timezone. */
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  reason: nonEmptyStringSchema.max(200),
  isRecurring: z.boolean().default(false),
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

/** Admin form update — accepts civil date string. */
export const updateHolidayActionSchema = z
  .object({
    date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD")
      .optional(),
    reason: nonEmptyStringSchema.max(200).optional(),
    isRecurring: z.boolean().optional(),
    isActive: isActiveSchema.optional(),
  })
  .strict();

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type CreateHolidayActionInput = z.infer<typeof createHolidayActionSchema>;
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;
export type UpdateHolidayActionInput = z.infer<typeof updateHolidayActionSchema>;
