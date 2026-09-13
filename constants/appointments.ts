/**
 * Appointment booking and lifecycle constants.
 */

export const BOOKING_SOURCES = {
  PUBLIC: "PUBLIC",
  STAFF: "STAFF",
  PATIENT_PORTAL: "PATIENT_PORTAL",
} as const;

export type BookingSource =
  (typeof BOOKING_SOURCES)[keyof typeof BOOKING_SOURCES];

export const BOOKING_SOURCE_VALUES = [
  BOOKING_SOURCES.PUBLIC,
  BOOKING_SOURCES.STAFF,
  BOOKING_SOURCES.PATIENT_PORTAL,
] as const;

export const APPOINTMENT_EVENT_TYPES = {
  CREATED: "CREATED",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  RESCHEDULED: "RESCHEDULED",
  COMPLETED: "COMPLETED",
  REMINDER_DUE: "REMINDER_DUE",
} as const;

export type AppointmentEventType =
  (typeof APPOINTMENT_EVENT_TYPES)[keyof typeof APPOINTMENT_EVENT_TYPES];

export const APPOINTMENT_EVENT_TYPE_VALUES = [
  APPOINTMENT_EVENT_TYPES.CREATED,
  APPOINTMENT_EVENT_TYPES.CONFIRMED,
  APPOINTMENT_EVENT_TYPES.CANCELLED,
  APPOINTMENT_EVENT_TYPES.RESCHEDULED,
  APPOINTMENT_EVENT_TYPES.COMPLETED,
  APPOINTMENT_EVENT_TYPES.REMINDER_DUE,
] as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: "EMAIL",
  WHATSAPP: "WHATSAPP",
  REMINDER: "REMINDER",
} as const;

export type NotificationChannel =
  (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];

export const NOTIFICATION_CHANNEL_VALUES = [
  NOTIFICATION_CHANNELS.EMAIL,
  NOTIFICATION_CHANNELS.WHATSAPP,
  NOTIFICATION_CHANNELS.REMINDER,
] as const;

export const NOTIFICATION_STATUSES = {
  PENDING: "PENDING",
  SENDING: "SENDING",
  SENT: "SENT",
  FAILED: "FAILED",
} as const;

export type NotificationStatus =
  (typeof NOTIFICATION_STATUSES)[keyof typeof NOTIFICATION_STATUSES];

export const NOTIFICATION_STATUS_VALUES = [
  NOTIFICATION_STATUSES.PENDING,
  NOTIFICATION_STATUSES.SENT,
  NOTIFICATION_STATUSES.FAILED,
] as const;

/** Admin list filter — excludes internal-only statuses from the default filter UI. */
export const ADMIN_APPOINTMENT_STATUS_FILTER_VALUES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

/** Public duplicate-booking copy — no appointment details. */
export const ACTIVE_BOOKING_CONFLICT_MESSAGE =
  "You already have an upcoming appointment with us. Please contact the clinic if you need to reschedule or cancel.";

export const BOOKING_RATE_LIMIT_MESSAGE =
  "Too many booking attempts. Please wait a few minutes and try again.";

export const STAFF_ACTIVE_BOOKING_CONFIRMATION_MESSAGE =
  "This patient already has an active appointment. Continue and create another appointment?";
