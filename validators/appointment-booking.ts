import { z } from "zod";

import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { ADMIN_APPOINTMENT_STATUS_FILTER_VALUES } from "@/constants/appointments";
import {
  appointmentPatientSnapshotSchema,
  appointmentTimeWindowSchema,
} from "@/validators/appointment";
import { civilDateSchema } from "@/validators/availability";
import {
  emailSchema,
  nonEmptyStringSchema,
  objectIdSchema,
  phoneSchema,
} from "@/validators/common";
import { paginationQuerySchema } from "@/validators/pagination";

/**
 * Public guest booking request.
 */
export const publicBookingSchema = z
  .object({
    fullName: nonEmptyStringSchema.max(120),
    phone: phoneSchema,
    email: z.union([emailSchema, z.literal("")]),
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
