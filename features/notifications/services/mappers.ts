import "server-only";

import type { LeanNotification } from "@/models/notification";
import type { NotificationListItem } from "@/features/notifications/types";

export function toNotificationListItem(
  doc: LeanNotification,
): NotificationListItem {
  return {
    id: String(doc._id),
    type: doc.type,
    event: doc.event,
    title: doc.title,
    description: doc.description,
    href: doc.href,
    isRead: doc.isRead,
    readAt: doc.readAt ? doc.readAt.toISOString() : null,
    relatedEntityType: doc.relatedEntityType,
    relatedEntityId: doc.relatedEntityId ? String(doc.relatedEntityId) : null,
    createdAt: doc.createdAt.toISOString(),
  };
}
