import { z } from "zod";

import {
  NOTIFICATION_CENTER_LIMIT,
  NOTIFICATION_EVENT_VALUES,
  NOTIFICATION_RELATED_ENTITY_TYPES,
  NOTIFICATION_TYPE_VALUES,
} from "@/constants/notifications";
import {
  nonEmptyStringSchema,
  objectIdSchema,
} from "@/validators/common";

export const notificationTypeSchema = z.enum(NOTIFICATION_TYPE_VALUES);

export const createNotificationSchema = z.object({
  type: notificationTypeSchema,
  event: z.string().trim().min(1).max(80),
  title: nonEmptyStringSchema.max(160, "Title is too long"),
  description: nonEmptyStringSchema.max(500, "Description is too long"),
  href: z.string().trim().max(500).nullable().optional(),
  relatedEntityType: z
    .enum([
      NOTIFICATION_RELATED_ENTITY_TYPES.APPOINTMENT,
      NOTIFICATION_RELATED_ENTITY_TYPES.CONTACT_MESSAGE,
      NOTIFICATION_RELATED_ENTITY_TYPES.PRESCRIPTION,
    ])
    .nullable()
    .optional(),
  relatedEntityId: objectIdSchema.nullable().optional(),
  recipientUserId: objectIdSchema.nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  idempotencyKey: z.string().trim().min(1).max(200).nullable().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export const listNotificationsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(NOTIFICATION_CENTER_LIMIT),
});

export type ListNotificationsQuery = z.infer<
  typeof listNotificationsQuerySchema
>;

export const markNotificationReadSchema = z.object({
  id: objectIdSchema,
});

export type MarkNotificationReadInput = z.infer<
  typeof markNotificationReadSchema
>;

/** Known seed events — kept for documentation / future validators. */
export const knownNotificationEventSchema = z.enum(NOTIFICATION_EVENT_VALUES);
