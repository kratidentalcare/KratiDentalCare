import type {
  AppointmentDurationMinutes,
  AvailabilityStatus,
  Weekday,
} from "@/constants/scheduling";

/**
 * Half-open UTC interval `[startMs, endMs)`.
 */
export type TimeInterval = {
  startMs: number;
  endMs: number;
};

/**
 * A single dynamically generated bookable slot (never persisted as inventory).
 */
export type GeneratedSlot = {
  /** ISO-8601 UTC start instant. */
  startAt: string;
  /** ISO-8601 UTC end instant. */
  endAt: string;
  /** Clinic-local display label, e.g. `10:00 AM`. */
  label: string;
};

/**
 * Stable DTO returned by `generateAvailableSlots`.
 * Admin preview and future patient booking consume the same shape.
 */
export type AvailabilityResult = {
  date: string;
  timezone: string;
  durationMinutes: AppointmentDurationMinutes;
  status: AvailabilityStatus;
  reason: string | null;
  slots: GeneratedSlot[];
  /** Total candidate slots before appointment / past-time filtering (debug-friendly). */
  generatedCount: number;
  availableCount: number;
};

export type SchedulingBreak = {
  startTime: string;
  endTime: string;
};

export type SchedulingSettingsInput = {
  timezone: string;
  workingDays: readonly Weekday[];
  openingTime: string;
  closingTime: string;
  appointmentDurationMinutes: AppointmentDurationMinutes;
  breaks: readonly SchedulingBreak[];
};

export type SchedulingHolidayMatch = {
  reason: string;
  isRecurring: boolean;
};

export type SchedulingOverrideInput = {
  type: "ALL_DAY" | "TIME_RANGE";
  startTime: string | null;
  endTime: string | null;
  reason: string;
};

export type SchedulingAppointmentWindow = {
  startsAt: Date | string | number;
  endsAt: Date | string | number;
};

export type GenerateSlotsEngineInput = {
  date: string;
  settings: SchedulingSettingsInput;
  holiday?: SchedulingHolidayMatch | null;
  overrides?: readonly SchedulingOverrideInput[];
  appointments?: readonly SchedulingAppointmentWindow[];
  /** Wall-clock "now" (UTC Date). Defaults to `new Date()`. */
  now?: Date;
  /**
   * When true, past times for today are kept in the result
   * (admin diagnostics). Default false for booking paths.
   */
  includePastTimes?: boolean;
  /** Optional duration override (future multi-service booking). */
  durationMinutes?: AppointmentDurationMinutes;
};

export type ClinicAvailabilityFormValues = {
  timezone: string;
  workingDays: Weekday[];
  openingTime: string;
  closingTime: string;
  appointmentDurationMinutes: AppointmentDurationMinutes;
  breaks: Array<{
    startTime: string;
    endTime: string;
    label?: string | null;
  }>;
};

export type HolidayListItem = {
  id: string;
  date: string;
  reason: string;
  isRecurring: boolean;
  isActive: boolean;
};

export type OverrideListItem = {
  id: string;
  date: string;
  type: "ALL_DAY" | "TIME_RANGE";
  startTime: string | null;
  endTime: string | null;
  reason: string;
  isActive: boolean;
};
