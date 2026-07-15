import { z } from "zod";

import {
  CONSULTATION_DURATION_MINUTES,
  TIME_OF_DAY_PATTERN,
  WEEKDAY_VALUES,
} from "@/constants/doctor";
import { DOCTOR_STATUSES } from "@/constants/statuses";
import {
  doctorStatusSchema,
  isActiveSchema,
  nonEmptyStringSchema,
  nullableObjectIdSchema,
  objectIdSchema,
} from "@/validators/common";

/**
 * Zod contracts for Doctor professional fields (persistence boundary).
 * Not an API surface — Server Actions will reuse these later.
 */

export const doctorSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case")
  .max(120);

export const specialtySchema = nonEmptyStringSchema.max(80);

export const specialtiesSchema = z
  .array(specialtySchema)
  .min(1, "At least one specialty is required")
  .max(20);

export const weekdaySchema = z.enum(WEEKDAY_VALUES);

export const workingDaysSchema = z
  .array(weekdaySchema)
  .min(1, "At least one working day is required")
  .max(7)
  .refine((days) => new Set(days).size === days.length, {
    message: "workingDays must be unique",
  });

export const consultationDurationSchema = z
  .number()
  .refine(
    (value): value is (typeof CONSULTATION_DURATION_MINUTES)[number] =>
      (CONSULTATION_DURATION_MINUTES as readonly number[]).includes(value),
    {
      message: `consultationDuration must be one of: ${CONSULTATION_DURATION_MINUTES.join(", ")}`,
    },
  );

export const timeOfDaySchema = z
  .string()
  .trim()
  .regex(TIME_OF_DAY_PATTERN, "Time must be HH:mm (24h)");

export const profilePhotoSchema = z
  .string()
  .trim()
  .url("profilePhoto must be a valid URL")
  .max(2048)
  .nullable()
  .optional();

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

const doctorAvailabilityWindowSchema = z
  .object({
    startTime: timeOfDaySchema,
    endTime: timeOfDaySchema,
  })
  .refine((value) => timeToMinutes(value.endTime) > timeToMinutes(value.startTime), {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export const createDoctorSchema = z
  .object({
    userId: nullableObjectIdSchema.optional(),
    fullName: nonEmptyStringSchema.max(120),
    slug: doctorSlugSchema,
    specialties: specialtiesSchema,
    qualification: z.string().trim().max(200).nullable().optional(),
    registrationNumber: z.string().trim().max(64).nullable().optional(),
    yearsOfExperience: z.number().int().min(0).max(80).nullable().optional(),
    consultationFee: z.number().min(0).nullable().optional(),
    bio: z.string().trim().max(5000).nullable().optional(),
    languages: z.array(nonEmptyStringSchema.max(40)).max(20).optional(),
    workingDays: workingDaysSchema.optional(),
    consultationDuration: consultationDurationSchema.optional(),
    startTime: timeOfDaySchema.optional(),
    endTime: timeOfDaySchema.optional(),
    profilePhoto: profilePhotoSchema,
    isAvailable: z.boolean().optional(),
    status: doctorStatusSchema.default(DOCTOR_STATUSES.ACTIVE),
    isActive: isActiveSchema.optional(),
    displayOrder: z.number().int().min(0).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.startTime && value.endTime) {
      const parsed = doctorAvailabilityWindowSchema.safeParse({
        startTime: value.startTime,
        endTime: value.endTime,
      });
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          ctx.addIssue(issue);
        }
      }
    }
  });

export const updateDoctorSchema = z
  .object({
    userId: z.union([objectIdSchema, z.null()]).optional(),
    fullName: nonEmptyStringSchema.max(120).optional(),
    slug: doctorSlugSchema.optional(),
    specialties: specialtiesSchema.optional(),
    qualification: z.string().trim().max(200).nullable().optional(),
    registrationNumber: z.string().trim().max(64).nullable().optional(),
    yearsOfExperience: z.number().int().min(0).max(80).nullable().optional(),
    consultationFee: z.number().min(0).nullable().optional(),
    bio: z.string().trim().max(5000).nullable().optional(),
    languages: z.array(nonEmptyStringSchema.max(40)).max(20).optional(),
    workingDays: workingDaysSchema.optional(),
    consultationDuration: consultationDurationSchema.optional(),
    startTime: timeOfDaySchema.optional(),
    endTime: timeOfDaySchema.optional(),
    profilePhoto: profilePhotoSchema,
    isAvailable: z.boolean().optional(),
    status: doctorStatusSchema.optional(),
    isActive: isActiveSchema.optional(),
    displayOrder: z.number().int().min(0).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.startTime && value.endTime) {
      const parsed = doctorAvailabilityWindowSchema.safeParse({
        startTime: value.startTime,
        endTime: value.endTime,
      });
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          ctx.addIssue(issue);
        }
      }
    }
  });

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
