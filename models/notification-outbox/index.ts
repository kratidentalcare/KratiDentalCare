import "server-only";

import { getOrCreateModel } from "@/models/base";

import {
  notificationOutboxSchema,
  NOTIFICATION_OUTBOX_MODEL_NAME,
} from "./schema";
import type {
  NotificationOutboxDocument,
  NotificationOutboxModel,
} from "./types";

export const NotificationOutbox = getOrCreateModel<NotificationOutboxDocument>(
  NOTIFICATION_OUTBOX_MODEL_NAME,
  notificationOutboxSchema,
) as NotificationOutboxModel;

export type {
  LeanNotificationOutbox,
  NotificationOutboxDocument,
  NotificationOutboxFields,
  NotificationOutboxModel,
} from "./types";
export {
  notificationOutboxSchema,
  NOTIFICATION_OUTBOX_MODEL_NAME,
} from "./schema";
