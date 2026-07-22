import "server-only";

import { getOrCreateModel } from "@/models/base";

import {
  NOTIFICATION_MODEL_NAME,
  notificationSchema,
} from "./schema";
import type {
  NotificationDocument,
  NotificationModel,
} from "./types";

/**
 * Notification model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Notification = getOrCreateModel<NotificationDocument>(
  NOTIFICATION_MODEL_NAME,
  notificationSchema,
) as NotificationModel;

export type {
  LeanNotification,
  NotificationDocument,
  NotificationFields,
  NotificationModel,
} from "./types";
export {
  NOTIFICATION_MODEL_NAME,
  notificationSchema,
} from "./schema";
