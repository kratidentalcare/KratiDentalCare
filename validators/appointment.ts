import { z } from "zod";

import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import {
  appointmentStatusSchema,
  emailSchema,
  nonEmptyStringSchema,
  objectIdSchema,
  phoneSchema,
} from "@/validators/common";

/**
 * Zod contracts for Appointment visit fields (persistence boundary).
 * Status transition rules remain in services / Server Actions later.
 */

const MIN_DURATION_MS = 5 * 60 * 1000;

export const appointmentPatientSnapshotSchema = z.object({
  fullName: nonEmptyStringSchema.max(120),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal("")]),
});

export const appointmentDoctorSnapshotSchema = z.object({
  fullName: nonEmptyStringSchema.max(120),
  specialties: z.array(nonEmptyStringSchema.max(80)).min(1).max(20),
});

export const appointmentTimeWindowSchema = z
  .object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((value) => value.endsAt.getTime() > value.startsAt.getTime(), {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  })
  .refine(
    (value) =>
      value.endsAt.getTime() - value.startsAt.getTime() >= MIN_DURATION_MS,
    {
      message: "appointment duration must be at least 5 minutes",
      path: ["endsAt"],
    },
  );

export const createAppointmentSchema = z
  .object({
    patientId: objectIdSchema,
    doctorId: objectIdSchema,
    slotId: objectIdSchema,
    status: appointmentStatusSchema.default(APPOINTMENT_STATUSES.PENDING),
    reason: z.string().trim().max(500).nullable().optional(),
    notes: z.string().trim().max(5000).nullable().optional(),
    cancellationReason: z.string().trim().max(500).nullable().optional(),
    cancelledAt: z.coerce.date().nullable().optional(),
    cancelledByUserId: objectIdSchema.nullable().optional(),
    bookedByUserId: objectIdSchema,
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    checkedInAt: z.coerce.date().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
    patientSnapshot: appointmentPatientSnapshotSchema,
    doctorSnapshot: appointmentDoctorSnapshotSchema,
  })
  .superRefine((value, ctx) => {
    const window = appointmentTimeWindowSchema.safeParse({
      startsAt: value.startsAt,
      endsAt: value.endsAt,
    });
    if (!window.success) {
      for (const issue of window.error.issues) {
        ctx.addIssue(issue);
      }
    }

    if (value.status === APPOINTMENT_STATUSES.CANCELLED) {
      if (value.cancelledAt == null) {
        ctx.addIssue({
          code: "custom",
          message: "cancelledAt is required when CANCELLED",
          path: ["cancelledAt"],
        });
      }
      if (value.cancelledByUserId == null) {
        ctx.addIssue({
          code: "custom",
          message: "cancelledByUserId is required when CANCELLED",
          path: ["cancelledByUserId"],
        });
      }
    }

    if (
      value.status !== APPOINTMENT_STATUSES.CANCELLED &&
      (value.cancelledAt != null ||
        value.cancelledByUserId != null ||
        (value.cancellationReason != null && value.cancellationReason !== ""))
    ) {
      ctx.addIssue({
        code: "custom",
        message: "cancellation fields are only valid when status is CANCELLED",
        path: ["cancellationReason"],
      });
    }

    if (
      (value.status === APPOINTMENT_STATUSES.CHECKED_IN ||
        value.status === APPOINTMENT_STATUSES.COMPLETED) &&
      value.checkedInAt == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "checkedInAt is required when CHECKED_IN or COMPLETED",
        path: ["checkedInAt"],
      });
    }

    if (
      value.status === APPOINTMENT_STATUSES.COMPLETED &&
      value.completedAt == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "completedAt is required when COMPLETED",
        path: ["completedAt"],
      });
    }
  });

export const updateAppointmentSchema = z
  .object({
    status: appointmentStatusSchema.optional(),
    reason: z.string().trim().max(500).nullable().optional(),
    notes: z.string().trim().max(5000).nullable().optional(),
    cancellationReason: z.string().trim().max(500).nullable().optional(),
    cancelledAt: z.coerce.date().nullable().optional(),
    cancelledByUserId: objectIdSchema.nullable().optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    checkedInAt: z.coerce.date().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
    patientSnapshot: appointmentPatientSnapshotSchema.optional(),
    doctorSnapshot: appointmentDoctorSnapshotSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.startsAt && value.endsAt) {
      const window = appointmentTimeWindowSchema.safeParse({
        startsAt: value.startsAt,
        endsAt: value.endsAt,
      });
      if (!window.success) {
        for (const issue of window.error.issues) {
          ctx.addIssue(issue);
        }
      }
    }
  });

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentPatientSnapshotInput = z.infer<
  typeof appointmentPatientSnapshotSchema
>;
export type AppointmentDoctorSnapshotInput = z.infer<
  typeof appointmentDoctorSnapshotSchema
>;
