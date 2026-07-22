import "server-only";

import { NOTIFICATION_CENTER_LIMIT } from "@/constants/notifications";
import { connect } from "@/lib/db";
import {
  Notification,
  type LeanNotification,
} from "@/models/notification";
import { toNotificationListItem } from "@/features/notifications/services/mappers";
import type { NotificationListItem } from "@/features/notifications/types";

/**
 * Recent notifications for the Notification Center panel (newest first).
 */
export async function listNotifications(
  limit: number = NOTIFICATION_CENTER_LIMIT,
): Promise<NotificationListItem[]> {
  await connect();

  const rows = await Notification.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<LeanNotification[]>();

  return rows.map(toNotificationListItem);
}
