import type { Model, Types } from "mongoose";

import type {
  NotificationEvent,
  NotificationRelatedEntityType,
  NotificationType,
} from "@/constants/notifications";
import type {
  LeanSoftDeleteDocument,
  SoftDeleteDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * In-app admin Notification Center row.
 * Broadcast when `recipientUserId` is null (clinic-wide).
 */
export type NotificationFields = {
  type: NotificationType;
  event: NotificationEvent | string;
  title: string;
  description: string;
  href: string | null;
  isRead: boolean;
  readAt: Date | null;
  relatedEntityType: NotificationRelatedEntityType | string | null;
  relatedEntityId: Types.ObjectId | null;
  /** null = all dashboard staff; set later for per-user targeting. */
  recipientUserId: Types.ObjectId | null;
  metadata: Record<string, unknown> | null;
  /** Prevents duplicate inserts on retries / double hooks. */
  idempotencyKey: string | null;
};

export type NotificationDocument = SoftDeleteDocument & NotificationFields;

export type LeanNotification = LeanSoftDeleteDocument & NotificationFields;

export type NotificationModel = Model<
  NotificationDocument,
  SoftDeleteQueryHelpers
>;
