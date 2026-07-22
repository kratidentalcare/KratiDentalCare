/**
 * In-app Notification Center — admin bell feed.
 *
 * Outbound email / WhatsApp intents remain in `NotificationOutbox`
 * (`features/appointments/services/notification-events.ts`).
 */

export type {
  NotificationCenterData,
  NotificationListItem,
} from "./types";

export { createNotification } from "./services/create-notification";
export {
  notifyAppointmentCancelled,
  notifyAppointmentCompleted,
  notifyNewAppointment,
  notifyNewContactInquiry,
} from "./services/emitters";
export { getNotificationCenterData } from "./services/get-notification-center-data";
export { countUnreadNotifications } from "./services/count-unread-notifications";
export { listNotifications } from "./services/list-notifications";
export {
  markAllNotificationsRead,
  markNotificationRead,
} from "./services/mark-notification-read";
