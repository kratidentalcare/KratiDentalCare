import { z } from "zod";

import { CLINIC_SETTINGS_KEY } from "@/constants/app";
import {
  APPOINTMENT_DURATION_MINUTES,
  DEFAULT_APPOINTMENT_DURATION_MINUTES,
  DEFAULT_CLINIC_CLOSING_TIME,
  DEFAULT_CLINIC_OPENING_TIME,
  DEFAULT_CLINIC_TIMEZONE,
  DEFAULT_WORKING_DAYS,
  TIME_OF_DAY_PATTERN,
} from "@/constants/scheduling";
import {
  emailSchema,
  isActiveSchema,
  nonEmptyStringSchema,
  objectIdSchema,
  phoneSchema,
} from "@/validators/common";
import { workingDaysSchema } from "@/validators/doctor";
import { patientAddressSchema } from "@/validators/patient";

export { weekdaySchema, workingDaysSchema } from "@/validators/doctor";

/**
 * Zod contracts for ClinicSettings (persistence + admin form boundary).
 */

export const timeOfDaySchema = z
  .string()
  .trim()
  .regex(TIME_OF_DAY_PATTERN, "Time must be HH:mm (24h)");

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export const appointmentDurationMinutesSchema = z
  .number()
  .refine(
    (value): value is (typeof APPOINTMENT_DURATION_MINUTES)[number] =>
      (APPOINTMENT_DURATION_MINUTES as readonly number[]).includes(value),
    {
      message: `appointmentDurationMinutes must be one of: ${APPOINTMENT_DURATION_MINUTES.join(", ")}`,
    },
  );

export const timezoneSchema = z
  .string()
  .trim()
  .min(1, "timezone is required")
  .max(64)
  .refine(
    (value) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value });
        return true;
      } catch {
        return false;
      }
    },
    { message: "timezone must be a valid IANA identifier" },
  );

export const clinicBreakWindowSchema = z
  .object({
    startTime: timeOfDaySchema,
    endTime: timeOfDaySchema,
    label: z.string().trim().max(80).nullable().optional(),
  })
  .refine(
    (value) => timeToMinutes(value.endTime) > timeToMinutes(value.startTime),
    {
      message: "break endTime must be after startTime",
      path: ["endTime"],
    },
  );

export const clinicBookingRulesSchema = z.object({
  minLeadTimeHours: z.number().min(0).max(168).default(0),
  maxAdvanceDays: z.number().int().min(1).max(365).default(60),
  cancellationCutoffHours: z.number().min(0).max(168).default(2),
  allowSameDayBooking: z.boolean().default(true),
});

export const clinicAddressSchema = patientAddressSchema;

const scheduleWindowRefine = <
  T extends {
    openingTime: string;
    closingTime: string;
    breaks?: Array<{ startTime: string; endTime: string }>;
  },
>(
  value: T,
  ctx: z.RefinementCtx,
) => {
  const openMins = timeToMinutes(value.openingTime);
  const closeMins = timeToMinutes(value.closingTime);

  if (closeMins <= openMins) {
    ctx.addIssue({
      code: "custom",
      message: "closingTime must be after openingTime",
      path: ["closingTime"],
    });
    return;
  }

  const breaks = value.breaks ?? [];
  for (let i = 0; i < breaks.length; i += 1) {
    const start = timeToMinutes(breaks[i].startTime);
    const end = timeToMinutes(breaks[i].endTime);
    if (start < openMins || end > closeMins) {
      ctx.addIssue({
        code: "custom",
        message: "breaks must fall within opening and closing times",
        path: ["breaks", i, "startTime"],
      });
    }
  }

  for (let i = 0; i < breaks.length; i += 1) {
    for (let j = i + 1; j < breaks.length; j += 1) {
      if (
        rangesOverlap(
          timeToMinutes(breaks[i].startTime),
          timeToMinutes(breaks[i].endTime),
          timeToMinutes(breaks[j].startTime),
          timeToMinutes(breaks[j].endTime),
        )
      ) {
        ctx.addIssue({
          code: "custom",
          message: "breaks must not overlap",
          path: ["breaks", j, "startTime"],
        });
      }
    }
  }
};

export const createClinicSettingsSchema = z
  .object({
    clinicKey: z
      .string()
      .trim()
      .toLowerCase()
      .max(64)
      .default(CLINIC_SETTINGS_KEY),
    clinicName: nonEmptyStringSchema.max(160),
    address: clinicAddressSchema,
    phone: phoneSchema,
    email: emailSchema,
    logoUrl: z.string().trim().url().max(2048).nullable().optional(),
    timezone: timezoneSchema.default(DEFAULT_CLINIC_TIMEZONE),
    workingDays: workingDaysSchema.default([...DEFAULT_WORKING_DAYS]),
    openingTime: timeOfDaySchema.default(DEFAULT_CLINIC_OPENING_TIME),
    closingTime: timeOfDaySchema.default(DEFAULT_CLINIC_CLOSING_TIME),
    appointmentDurationMinutes: appointmentDurationMinutesSchema.default(
      DEFAULT_APPOINTMENT_DURATION_MINUTES,
    ),
    breaks: z.array(clinicBreakWindowSchema).max(12).default([]),
    bookingRules: clinicBookingRulesSchema.default({
      minLeadTimeHours: 0,
      maxAdvanceDays: 60,
      cancellationCutoffHours: 2,
      allowSameDayBooking: true,
    }),
    updatedByUserId: objectIdSchema.nullable().optional(),
    isActive: isActiveSchema.optional(),
  })
  .superRefine(scheduleWindowRefine);

/**
 * Admin schedule form — scheduling fields only (identity/contact edited elsewhere later).
 */
export const updateClinicAvailabilitySchema = z
  .object({
    timezone: timezoneSchema.optional(),
    workingDays: workingDaysSchema.optional(),
    openingTime: timeOfDaySchema.optional(),
    closingTime: timeOfDaySchema.optional(),
    appointmentDurationMinutes: appointmentDurationMinutesSchema.optional(),
    breaks: z.array(clinicBreakWindowSchema).max(12).optional(),
    bookingRules: clinicBookingRulesSchema.partial().optional(),
    isActive: isActiveSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.openingTime && value.closingTime) {
      scheduleWindowRefine(
        {
          openingTime: value.openingTime,
          closingTime: value.closingTime,
          breaks: value.breaks,
        },
        ctx,
      );
    } else if (
      (value.openingTime || value.closingTime || value.breaks) &&
      !(value.openingTime && value.closingTime)
    ) {
      // Partial updates that change hours/breaks must send both bounds when validating breaks.
      // Service layer merges with existing settings before final validation.
    }
  });

export const updateClinicSettingsSchema = z
  .object({
    clinicName: nonEmptyStringSchema.max(160).optional(),
    address: clinicAddressSchema.partial().optional(),
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    logoUrl: z.string().trim().url().max(2048).nullable().optional(),
    timezone: timezoneSchema.optional(),
    workingDays: workingDaysSchema.optional(),
    openingTime: timeOfDaySchema.optional(),
    closingTime: timeOfDaySchema.optional(),
    appointmentDurationMinutes: appointmentDurationMinutesSchema.optional(),
    breaks: z.array(clinicBreakWindowSchema).max(12).optional(),
    bookingRules: clinicBookingRulesSchema.partial().optional(),
    isActive: isActiveSchema.optional(),
  })
  .strict();

export type CreateClinicSettingsInput = z.infer<
  typeof createClinicSettingsSchema
>;
export type UpdateClinicSettingsInput = z.infer<
  typeof updateClinicSettingsSchema
>;
export type UpdateClinicAvailabilityInput = z.infer<
  typeof updateClinicAvailabilitySchema
>;
export type ClinicBreakWindowInput = z.infer<typeof clinicBreakWindowSchema>;
export type ClinicBookingRulesInput = z.infer<typeof clinicBookingRulesSchema>;
