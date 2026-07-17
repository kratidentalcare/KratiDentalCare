import { z } from "zod";

import { CIVIL_DATE_PATTERN } from "@/constants/scheduling";
import { appointmentDurationMinutesSchema } from "@/validators/clinic-settings";
import { objectIdSchema } from "@/validators/common";

/**
 * Query / action contracts for the dynamic availability engine.
 */

export const civilDateSchema = z
  .string()
  .trim()
  .regex(CIVIL_DATE_PATTERN, "date must be YYYY-MM-DD");

export const generateAvailableSlotsQuerySchema = z.object({
  date: civilDateSchema,
  /** Optional future: doctor-scoped capacity. */
  doctorId: objectIdSchema.optional(),
  /** Optional override of clinic default duration. */
  durationMinutes: appointmentDurationMinutesSchema.optional(),
  /**
   * When true (admin live preview), still generate the day's theoretical
   * open slots but mark past times as filtered by the engine.
   */
  includePastTimes: z.boolean().optional().default(false),
});

export type GenerateAvailableSlotsQuery = z.infer<
  typeof generateAvailableSlotsQuerySchema
>;
