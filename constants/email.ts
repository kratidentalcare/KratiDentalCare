/**
 * Outbound appointment email types and action-token constants.
 */

export const EMAIL_TYPES = {
  ADMIN_NEW_APPOINTMENT: "ADMIN_NEW_APPOINTMENT",
  PATIENT_APPROVED: "PATIENT_APPROVED",
  PATIENT_CANCELLED: "PATIENT_CANCELLED",
  PATIENT_RESCHEDULED: "PATIENT_RESCHEDULED",
} as const;

export type EmailType = (typeof EMAIL_TYPES)[keyof typeof EMAIL_TYPES];

export const EMAIL_TYPE_VALUES = [
  EMAIL_TYPES.ADMIN_NEW_APPOINTMENT,
  EMAIL_TYPES.PATIENT_APPROVED,
  EMAIL_TYPES.PATIENT_CANCELLED,
  EMAIL_TYPES.PATIENT_RESCHEDULED,
] as const;

export const EMAIL_PROVIDERS = {
  RESEND: "resend",
  CONSOLE: "console",
} as const;

export type EmailProviderName =
  (typeof EMAIL_PROVIDERS)[keyof typeof EMAIL_PROVIDERS];

export const APPOINTMENT_EMAIL_ACTIONS = {
  APPROVE: "approve",
  CANCEL: "cancel",
  RESCHEDULE: "reschedule",
} as const;

export type AppointmentEmailAction =
  (typeof APPOINTMENT_EMAIL_ACTIONS)[keyof typeof APPOINTMENT_EMAIL_ACTIONS];

export const APPOINTMENT_EMAIL_ACTION_VALUES = [
  APPOINTMENT_EMAIL_ACTIONS.APPROVE,
  APPOINTMENT_EMAIL_ACTIONS.CANCEL,
  APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE,
] as const;

export const DEFAULT_EMAIL_ACTION_TOKEN_TTL_HOURS = 72;

export const DEFAULT_EMAIL_CANCEL_REASON =
  "Cancelled by clinic via email notification";
