import { z } from "zod";

import { CLINIC_SETTINGS_KEY } from "@/constants/app";
import {
  FOOTER_LINK_GROUP_VALUES,
} from "@/constants/clinic-settings";
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

/** Optional phone — empty string / null → null. */
export const optionalPhoneSchema = z
  .union([phoneSchema, z.literal(""), z.null()])
  .transform((value) => (value === "" || value == null ? null : value));

/**
 * https-only URL (rejects javascript:, data:, http:, etc.).
 * Empty / null → null.
 */
export const optionalHttpsUrlSchema = z
  .union([z.string().trim(), z.literal(""), z.null()])
  .transform((value) => (value === "" || value == null ? null : value))
  .refine(
    (value) => {
      if (value == null) return true;
      try {
        const parsed = new URL(value);
        return parsed.protocol === "https:" && value.length <= 2048;
      } catch {
        return false;
      }
    },
    { message: "Must be a valid https:// URL" },
  );

/**
 * Internal path (`/about`) or https URL. Rejects unsafe schemes.
 */
export const footerUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048)
  .refine(
    (value) => {
      if (value.startsWith("/") && !value.startsWith("//")) {
        const lower = value.toLowerCase();
        return (
          !lower.startsWith("/javascript:") &&
          !lower.startsWith("/data:") &&
          !lower.includes("javascript:") &&
          !lower.includes("data:")
        );
      }
      try {
        const parsed = new URL(value);
        return parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    {
      message:
        "URL must be an internal path (e.g. /about) or an https:// link",
    },
  );

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

export const clinicSocialLinksSchema = z.object({
  facebook: optionalHttpsUrlSchema.optional(),
  instagram: optionalHttpsUrlSchema.optional(),
  linkedin: optionalHttpsUrlSchema.optional(),
  youtube: optionalHttpsUrlSchema.optional(),
});

export const footerLinkGroupSchema = z.enum(FOOTER_LINK_GROUP_VALUES);

export const clinicFooterLinkSchema = z.object({
  label: nonEmptyStringSchema.max(80),
  url: footerUrlSchema,
  group: footerLinkGroupSchema,
  displayOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

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

const emptySocialLinks = {
  facebook: null as string | null,
  instagram: null as string | null,
  linkedin: null as string | null,
  youtube: null as string | null,
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
    secondaryPhone: optionalPhoneSchema.optional(),
    email: emailSchema,
    emergencyContact: optionalPhoneSchema.optional(),
    googleMapsUrl: optionalHttpsUrlSchema.optional(),
    logoUrl: optionalHttpsUrlSchema.optional(),
    socialLinks: clinicSocialLinksSchema.default(emptySocialLinks),
    footerLinks: z.array(clinicFooterLinkSchema).max(40).default([]),
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
    defaultDoctorId: objectIdSchema.nullable().optional(),
    updatedByUserId: objectIdSchema.nullable().optional(),
    isActive: isActiveSchema.optional(),
  })
  .superRefine(scheduleWindowRefine);

/**
 * Admin schedule form — scheduling fields only.
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
    defaultDoctorId: objectIdSchema.nullable().optional(),
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

/**
 * Identity, contact, footer, and default doctor — not scheduling hours.
 * Scheduling remains on Dashboard → Scheduling.
 */
export const updateClinicSettingsSchema = z
  .object({
    clinicName: nonEmptyStringSchema.max(160).optional(),
    address: clinicAddressSchema.partial().optional(),
    phone: phoneSchema.optional(),
    secondaryPhone: optionalPhoneSchema.optional(),
    email: emailSchema.optional(),
    emergencyContact: optionalPhoneSchema.optional(),
    googleMapsUrl: optionalHttpsUrlSchema.optional(),
    logoUrl: optionalHttpsUrlSchema.optional(),
    socialLinks: clinicSocialLinksSchema.optional(),
    footerLinks: z.array(clinicFooterLinkSchema).max(40).optional(),
    defaultDoctorId: objectIdSchema.nullable().optional(),
    isActive: isActiveSchema.optional(),
  })
  .strict();

/** Clinic info tab form (required fields). */
export const clinicInfoFormSchema = z.object({
  clinicName: nonEmptyStringSchema.max(160),
  phone: phoneSchema,
  secondaryPhone: optionalPhoneSchema,
  email: emailSchema,
  emergencyContact: optionalPhoneSchema,
});

/** Contact & address tab form. */
export const clinicContactFormSchema = z.object({
  line1: nonEmptyStringSchema.max(200),
  line2: z
    .union([z.string().trim().max(200), z.literal(""), z.null()])
    .transform((value) => (value === "" || value == null ? null : value)),
  city: nonEmptyStringSchema.max(100),
  state: nonEmptyStringSchema.max(100),
  postalCode: nonEmptyStringSchema.max(20),
  country: z
    .string()
    .trim()
    .length(2, "country must be a 2-letter ISO code")
    .transform((value) => value.toUpperCase()),
  googleMapsUrl: optionalHttpsUrlSchema,
});

/** Footer social links form. */
export const clinicSocialFormSchema = clinicSocialLinksSchema;

/** Single footer link form (create / edit). */
export const clinicFooterLinkFormSchema = clinicFooterLinkSchema;

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
export type ClinicInfoFormValues = z.infer<typeof clinicInfoFormSchema>;
export type ClinicContactFormValues = z.infer<typeof clinicContactFormSchema>;
export type ClinicSocialFormValues = z.infer<typeof clinicSocialFormSchema>;
export type ClinicFooterLinkFormValues = z.infer<
  typeof clinicFooterLinkFormSchema
>;
