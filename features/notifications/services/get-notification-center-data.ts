import "server-only";

import { NOTIFICATION_CENTER_LIMIT } from "@/constants/notifications";
import { countUnreadNotifications } from "@/features/notifications/services/count-unread-notifications";
import { listNotifications } from "@/features/notifications/services/list-notifications";
import type { NotificationCenterData } from "@/features/notifications/types";

/**
 * Single payload for dashboard chrome (bell badge + panel seed).
 */
export async function getNotificationCenterData(
  limit: number = NOTIFICATION_CENTER_LIMIT,
): Promise<NotificationCenterData> {
  const [items, unreadCount] = await Promise.all([
    listNotifications(limit),
    countUnreadNotifications(),
  ]);

  return { items, unreadCount };
}
