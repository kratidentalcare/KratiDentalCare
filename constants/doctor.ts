/**
 * Doctor scheduling / consultation constants (shared by schema + validators).
 */

export const WEEKDAYS = {
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
  SUNDAY: "SUNDAY",
} as const;

export type Weekday = (typeof WEEKDAYS)[keyof typeof WEEKDAYS];

export const WEEKDAY_VALUES = [
  WEEKDAYS.MONDAY,
  WEEKDAYS.TUESDAY,
  WEEKDAYS.WEDNESDAY,
  WEEKDAYS.THURSDAY,
  WEEKDAYS.FRIDAY,
  WEEKDAYS.SATURDAY,
  WEEKDAYS.SUNDAY,
] as const;

/** Allowed consultation slot lengths in minutes. */
export const CONSULTATION_DURATION_MINUTES = [15, 20, 30, 45, 60] as const;

export type ConsultationDurationMinutes =
  (typeof CONSULTATION_DURATION_MINUTES)[number];

export const DEFAULT_CONSULTATION_DURATION_MINUTES = 30 satisfies ConsultationDurationMinutes;

/** 24h clock `HH:mm`. */
export const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
