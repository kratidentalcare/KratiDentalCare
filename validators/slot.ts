import { z } from "zod";

import { SLOT_STATUSES } from "@/constants/statuses";
import {
  nonEmptyStringSchema,
  objectIdSchema,
  slotStatusSchema,
} from "@/validators/common";

/**
 * Zod contracts for Slot inventory fields (persistence boundary).
 * Not an API surface — status transitions stay in services later.
 */

const MIN_DURATION_MS = 5 * 60 * 1000;

export const slotWindowSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
  })
  .refine((value) => value.endAt.getTime() > value.startAt.getTime(), {
    message: "endAt must be after startAt",
    path: ["endAt"],
  })
  .refine(
    (value) => value.endAt.getTime() - value.startAt.getTime() >= MIN_DURATION_MS,
    {
      message: "slot duration must be at least 5 minutes",
      path: ["endAt"],
    },
  );

export const createSlotSchema = z
  .object({
    doctorId: objectIdSchema,
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    status: slotStatusSchema.default(SLOT_STATUSES.AVAILABLE),
    appointmentId: objectIdSchema.nullable().optional(),
    createdByUserId: objectIdSchema,
    notes: z.string().trim().max(1000).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    const window = slotWindowSchema.safeParse({
      startAt: value.startAt,
      endAt: value.endAt,
    });
    if (!window.success) {
      for (const issue of window.error.issues) {
        ctx.addIssue(issue);
      }
    }

    if (
      value.status === SLOT_STATUSES.BOOKED &&
      (value.appointmentId == null || value.appointmentId === undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "appointmentId is required when status is BOOKED",
        path: ["appointmentId"],
      });
    }

    if (
      value.status !== SLOT_STATUSES.BOOKED &&
      value.appointmentId != null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "appointmentId must be null unless status is BOOKED",
        path: ["appointmentId"],
      });
    }
  });

export const updateSlotSchema = z
  .object({
    doctorId: objectIdSchema.optional(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    status: slotStatusSchema.optional(),
    appointmentId: objectIdSchema.nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.startAt && value.endAt) {
      const window = slotWindowSchema.safeParse({
        startAt: value.startAt,
        endAt: value.endAt,
      });
      if (!window.success) {
        for (const issue of window.error.issues) {
          ctx.addIssue(issue);
        }
      }
    }

    if (
      value.status === SLOT_STATUSES.BOOKED &&
      value.appointmentId === null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "appointmentId is required when status is BOOKED",
        path: ["appointmentId"],
      });
    }

    if (
      value.status != null &&
      value.status !== SLOT_STATUSES.BOOKED &&
      value.appointmentId != null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "appointmentId must be null unless status is BOOKED",
        path: ["appointmentId"],
      });
    }
  });

/** Convenience: notes-only validation helper for block/holiday reasons. */
export const slotNotesSchema = nonEmptyStringSchema.max(1000).nullable();

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
