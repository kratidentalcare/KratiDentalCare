import "server-only";

import { connect } from "@/lib/db";
import { Notification } from "@/models/notification";

/**
 * Unread badge count for the header bell.
 */
export async function countUnreadNotifications(): Promise<number> {
  await connect();
  return Notification.countDocuments({ isRead: false });
}
