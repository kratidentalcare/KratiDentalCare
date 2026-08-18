import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { getNotificationCenterData } from "@/features/notifications/services/get-notification-center-data";
import type { NotificationCenterData } from "@/features/notifications/types";

export const EMPTY_NOTIFICATION_CENTER: NotificationCenterData = {
  items: [],
  unreadCount: 0,
};

/**
 * Header bell seeded from the server (streamed via Suspense).
 */
export async function DashboardNotificationBell() {
  let data = EMPTY_NOTIFICATION_CENTER;
  try {
    data = await getNotificationCenterData();
  } catch {
    data = EMPTY_NOTIFICATION_CENTER;
  }

  return <NotificationBell initialData={data} />;
}
