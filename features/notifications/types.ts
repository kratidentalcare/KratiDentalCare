import type { NotificationType } from "@/constants/notifications";

export type NotificationListItem = {
  id: string;
  type: NotificationType;
  event: string;
  title: string;
  description: string;
  href: string | null;
  isRead: boolean;
  readAt: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
};

export type NotificationCenterData = {
  items: NotificationListItem[];
  unreadCount: number;
};
