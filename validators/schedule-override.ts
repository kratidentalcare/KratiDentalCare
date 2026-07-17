import { z } from "zod";

import {
  CIVIL_DATE_PATTERN,
  SCHEDULE_OVERRIDE_TYPES,
  SCHEDULE_OVERRIDE_TYPE_VALUES,
  TIME_OF_DAY_PATTERN,
} from "@/constants/scheduling";
import {
  isActiveSchema,
  nonEmptyStringSchema,
  objectIdSchema,
} from "@/validators/common";

/**
 * Zod contracts for ScheduleOverride (persistence + admin form boundary).
 */

export const civilDateSchema = z
  .string()
  .trim()
  .regex(CIVIL_DATE_PATTERN, "date must be YYYY-MM-DD");

export const timeOfDaySchema = z
  .string()
  .trim()
  .regex(TIME_OF_DAY_PATTERN, "Time must be HH:mm (24h)");

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Accept ISO datetime, Date, or civil YYYY-MM-DD for persistence boundary. */
export const scheduleOverrideDateSchema = z.union([
  civilDateSchema,
  z.coerce.date({ message: "date must be a valid date" }),
]);

function refineScheduleOverrideWindow(
  value: {
    type: (typeof SCHEDULE_OVERRIDE_TYPE_VALUES)[number];
    startTime?: string | null;
    endTime?: string | null;
  },
  ctx: z.RefinementCtx,
) {
  if (value.type === SCHEDULE_OVERRIDE_TYPES.ALL_DAY) {
    if (value.startTime != null || value.endTime != null) {
      ctx.addIssue({
        code: "custom",
        message: "startTime and endTime must be omitted for ALL_DAY blocks",
        path: ["startTime"],
      });
    }
    return;
  }

  if (value.startTime == null || value.endTime == null) {
    ctx.addIssue({
      code: "custom",
      message: "startTime and endTime are required for TIME_RANGE blocks",
      path: ["startTime"],
    });
    return;
  }

  if (timeToMinutes(value.endTime) <= timeToMinutes(value.startTime)) {
    ctx.addIssue({
      code: "custom",
      message: "endTime must be after startTime",
      path: ["endTime"],
    });
  }
}

export const createScheduleOverrideSchema = z
  .object({
    date: scheduleOverrideDateSchema,
    type: z.enum(SCHEDULE_OVERRIDE_TYPE_VALUES),
    startTime: timeOfDaySchema.nullable().optional(),
    endTime: timeOfDaySchema.nullable().optional(),
    reason: nonEmptyStringSchema.max(200),
    createdBy: objectIdSchema,
    isActive: isActiveSchema.optional(),
  })
  .superRefine(refineScheduleOverrideWindow);

/** Admin form input — createdBy injected server-side. */
export const createScheduleOverrideActionSchema = z
  .object({
    date: civilDateSchema,
    type: z.enum(SCHEDULE_OVERRIDE_TYPE_VALUES),
    startTime: timeOfDaySchema.nullable().optional(),
    endTime: timeOfDaySchema.nullable().optional(),
    reason: nonEmptyStringSchema.max(200),
    isActive: isActiveSchema.optional(),
  })
  .superRefine(refineScheduleOverrideWindow);

export const updateScheduleOverrideSchema = z
  .object({
    date: scheduleOverrideDateSchema.optional(),
    type: z.enum(SCHEDULE_OVERRIDE_TYPE_VALUES).optional(),
    startTime: timeOfDaySchema.nullable().optional(),
    endTime: timeOfDaySchema.nullable().optional(),
    reason: nonEmptyStringSchema.max(200).optional(),
    isActive: isActiveSchema.optional(),
  })
  .strict();

export type CreateScheduleOverrideInput = z.infer<
  typeof createScheduleOverrideSchema
>;
export type CreateScheduleOverrideActionInput = z.infer<
  typeof createScheduleOverrideActionSchema
>;
export type UpdateScheduleOverrideInput = z.infer<
  typeof updateScheduleOverrideSchema
>;
