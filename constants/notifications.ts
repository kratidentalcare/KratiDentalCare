/**
 * In-app Notification Center constants.
 * Separate from outbound `NotificationOutbox` (email / WhatsApp delivery).
 */

export const NOTIFICATION_TYPES = {
  APPOINTMENT: "APPOINTMENT",
  INQUIRY: "INQUIRY",
  SYSTEM: "SYSTEM",
  PRESCRIPTION: "PRESCRIPTION",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_TYPE_VALUES = [
  NOTIFICATION_TYPES.APPOINTMENT,
  NOTIFICATION_TYPES.INQUIRY,
  NOTIFICATION_TYPES.SYSTEM,
  NOTIFICATION_TYPES.PRESCRIPTION,
] as const;

/** Stable event keys for generation + idempotency. */
export const NOTIFICATION_EVENTS = {
  APPOINTMENT_CREATED: "APPOINTMENT_CREATED",
  APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
  APPOINTMENT_COMPLETED: "APPOINTMENT_COMPLETED",
  CONTACT_INQUIRY_CREATED: "CONTACT_INQUIRY_CREATED",
} as const;

export type NotificationEvent =
  (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];

export const NOTIFICATION_EVENT_VALUES = [
  NOTIFICATION_EVENTS.APPOINTMENT_CREATED,
  NOTIFICATION_EVENTS.APPOINTMENT_CANCELLED,
  NOTIFICATION_EVENTS.APPOINTMENT_COMPLETED,
  NOTIFICATION_EVENTS.CONTACT_INQUIRY_CREATED,
] as const;

export const NOTIFICATION_RELATED_ENTITY_TYPES = {
  APPOINTMENT: "appointment",
  CONTACT_MESSAGE: "contact_message",
  PRESCRIPTION: "prescription",
} as const;

export type NotificationRelatedEntityType =
  (typeof NOTIFICATION_RELATED_ENTITY_TYPES)[keyof typeof NOTIFICATION_RELATED_ENTITY_TYPES];

/** How many recent notifications the center loads by default. */
export const NOTIFICATION_CENTER_LIMIT = 20;
