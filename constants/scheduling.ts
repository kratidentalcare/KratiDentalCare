/**
 * Clinic scheduling / availability constants (shared by schema + validators + engine).
 */

import {
  CONSULTATION_DURATION_MINUTES,
  DEFAULT_CONSULTATION_DURATION_MINUTES,
  TIME_OF_DAY_PATTERN,
  WEEKDAY_VALUES,
  WEEKDAYS,
  type ConsultationDurationMinutes,
  type Weekday,
} from "@/constants/doctor";

export {
  CONSULTATION_DURATION_MINUTES,
  DEFAULT_CONSULTATION_DURATION_MINUTES,
  TIME_OF_DAY_PATTERN,
  WEEKDAY_VALUES,
  WEEKDAYS,
  type ConsultationDurationMinutes,
  type Weekday,
};

/** Default IANA timezone for v1 single-clinic India deployment. */
export const DEFAULT_CLINIC_TIMEZONE = "Asia/Kolkata";

/** Default clinic opening / closing (24h HH:mm). */
export const DEFAULT_CLINIC_OPENING_TIME = "10:00";
export const DEFAULT_CLINIC_CLOSING_TIME = "19:00";

/** Default working week for a typical dental clinic. */
export const DEFAULT_WORKING_DAYS: readonly Weekday[] = [
  WEEKDAYS.MONDAY,
  WEEKDAYS.TUESDAY,
  WEEKDAYS.WEDNESDAY,
  WEEKDAYS.THURSDAY,
  WEEKDAYS.FRIDAY,
  WEEKDAYS.SATURDAY,
];

/** Appointment durations allowed in scheduling config. */
export const APPOINTMENT_DURATION_MINUTES = CONSULTATION_DURATION_MINUTES;

export type AppointmentDurationMinutes = ConsultationDurationMinutes;

export const DEFAULT_APPOINTMENT_DURATION_MINUTES =
  DEFAULT_CONSULTATION_DURATION_MINUTES;

/** Civil date `YYYY-MM-DD`. */
export const CIVIL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const SCHEDULE_OVERRIDE_TYPES = {
  ALL_DAY: "ALL_DAY",
  TIME_RANGE: "TIME_RANGE",
} as const;

export type ScheduleOverrideType =
  (typeof SCHEDULE_OVERRIDE_TYPES)[keyof typeof SCHEDULE_OVERRIDE_TYPES];

export const SCHEDULE_OVERRIDE_TYPE_VALUES = [
  SCHEDULE_OVERRIDE_TYPES.ALL_DAY,
  SCHEDULE_OVERRIDE_TYPES.TIME_RANGE,
] as const;

/** Availability engine outcome for a selected civil date. */
export const AVAILABILITY_STATUSES = {
  AVAILABLE: "available",
  NON_WORKING_DAY: "non-working-day",
  HOLIDAY: "holiday",
  BLOCKED: "blocked",
  PAST_DATE: "past-date",
  FULLY_BOOKED: "fully-booked",
  CLINIC_CLOSED: "clinic-closed",
} as const;

export type AvailabilityStatus =
  (typeof AVAILABILITY_STATUSES)[keyof typeof AVAILABILITY_STATUSES];

export const AVAILABILITY_STATUS_VALUES = [
  AVAILABILITY_STATUSES.AVAILABLE,
  AVAILABILITY_STATUSES.NON_WORKING_DAY,
  AVAILABILITY_STATUSES.HOLIDAY,
  AVAILABILITY_STATUSES.BLOCKED,
  AVAILABILITY_STATUSES.PAST_DATE,
  AVAILABILITY_STATUSES.FULLY_BOOKED,
  AVAILABILITY_STATUSES.CLINIC_CLOSED,
] as const;

/** JS `Date.getUTCDay()` / weekday mapping used with clinic-local weekday. */
export const JS_WEEKDAY_TO_WEEKDAY = [
  WEEKDAYS.SUNDAY,
  WEEKDAYS.MONDAY,
  WEEKDAYS.TUESDAY,
  WEEKDAYS.WEDNESDAY,
  WEEKDAYS.THURSDAY,
  WEEKDAYS.FRIDAY,
  WEEKDAYS.SATURDAY,
] as const satisfies readonly Weekday[];
