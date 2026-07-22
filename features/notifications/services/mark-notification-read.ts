import "server-only";

import { connect } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  Notification,
  type LeanNotification,
} from "@/models/notification";
import { toNotificationListItem } from "@/features/notifications/services/mappers";
import type { NotificationListItem } from "@/features/notifications/types";
import {
  markNotificationReadSchema,
  type MarkNotificationReadInput,
} from "@/validators/notification";

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(
  input: MarkNotificationReadInput,
): Promise<NotificationListItem> {
  const parsed = markNotificationReadSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid notification id",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  await connect();

  const updated = await Notification.findByIdAndUpdate(
    parsed.data.id,
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    { new: true },
  ).lean<LeanNotification | null>();

  if (!updated) {
    throw new NotFoundError("Notification not found");
  }

  return toNotificationListItem(updated);
}

/**
 * Mark every unread notification as read.
 */
export async function markAllNotificationsRead(): Promise<{
  modifiedCount: number;
}> {
  await connect();

  const result = await Notification.updateMany(
    { isRead: false },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );

  return { modifiedCount: result.modifiedCount };
}
