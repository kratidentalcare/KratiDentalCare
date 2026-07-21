import { z } from "zod";

import { ADMIN_APPOINTMENT_STATUS_FILTER_VALUES } from "@/constants/appointments";
import {
  appointmentPatientSnapshotSchema,
  appointmentTimeWindowSchema,
} from "@/validators/appointment";
import { civilDateSchema } from "@/validators/availability";
import { genderSchema } from "@/validators/patient";
import {
  emailSchema,
  nonEmptyStringSchema,
  objectIdSchema,
  phoneSchema,
} from "@/validators/common";
import { paginationQuerySchema } from "@/validators/pagination";

/** Whole-year age collected at public booking (maps to patient dateOfBirth). */
export const bookingAgeYearsSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") {
        return undefined;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return value;
  },
  z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(120, "Age must be 120 or less"),
);

/**
 * Public guest booking request.
 */
export const publicBookingSchema = z
  .object({
    fullName: nonEmptyStringSchema.max(120),
    phone: phoneSchema,
    email: z.union([emailSchema, z.literal("")]),
    ageYears: bookingAgeYearsSchema,
    gender: genderSchema,
    reason: nonEmptyStringSchema.max(500),
    date: civilDateSchema,
    startAt: z.string().datetime({ offset: true }),
    endAt: z.string().datetime({ offset: true }),
    bookingReference: z.string().trim().min(8).max(128).optional(),
  })
  .superRefine((value, ctx) => {
    const window = appointmentTimeWindowSchema.safeParse({
      startsAt: value.startAt,
      endsAt: value.endAt,
    });
    if (!window.success) {
      for (const issue of window.error.issues) {
        ctx.addIssue({
          ...issue,
          path: issue.path[0] === "startsAt" ? ["startAt"] : ["endAt"],
        });
      }
    }
  });

export const bookingAvailabilityQuerySchema = z.object({
  date: civilDateSchema,
});

export const appointmentListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(ADMIN_APPOINTMENT_STATUS_FILTER_VALUES).optional(),
  date: civilDateSchema.optional(),
});

export const appointmentIdParamSchema = z.object({
  id: objectIdSchema,
});

export const approveAppointmentSchema = z.object({
  action: z.literal("approve"),
});

export const cancelAppointmentSchema = z.object({
  action: z.literal("cancel"),
  cancellationReason: nonEmptyStringSchema.max(500),
});

export const completeAppointmentSchema = z.object({
  action: z.literal("complete"),
});

export const rescheduleAppointmentSchema = z
  .object({
    action: z.literal("reschedule"),
    date: civilDateSchema,
    startAt: z.string().datetime({ offset: true }),
    endAt: z.string().datetime({ offset: true }),
  })
  .superRefine((value, ctx) => {
    const window = appointmentTimeWindowSchema.safeParse({
      startsAt: value.startAt,
      endsAt: value.endAt,
    });
    if (!window.success) {
      for (const issue of window.error.issues) {
        ctx.addIssue({
          ...issue,
          path: issue.path[0] === "startsAt" ? ["startAt"] : ["endAt"],
        });
      }
    }
  });

export const appointmentActionSchema = z.discriminatedUnion("action", [
  approveAppointmentSchema,
  cancelAppointmentSchema,
  completeAppointmentSchema,
  rescheduleAppointmentSchema,
]);

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
export type BookingAvailabilityQuery = z.infer<
  typeof bookingAvailabilityQuerySchema
>;
export type AppointmentListQuery = z.infer<typeof appointmentListQuerySchema>;
export type AppointmentActionInput = z.infer<typeof appointmentActionSchema>;

export const publicBookingPatientSchema = appointmentPatientSnapshotSchema;
