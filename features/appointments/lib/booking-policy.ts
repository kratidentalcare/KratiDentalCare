import type { ClinicBookingRules } from "@/models/clinic-settings/types";
import {
  parseCivilDate,
  formatCivilDate,
  utcToCivilDate,
} from "@/features/scheduling/lib/timezone";

export type BookingPolicyInput = {
  selectedDate: string;
  slotStartAt: Date;
  timezone: string;
  rules: ClinicBookingRules;
  now?: Date;
};

export type BookingPolicyViolation =
  | "past-date"
  | "same-day-disabled"
  | "too-far-in-advance"
  | "lead-time-not-met";

export type BookingPolicyResult =
  | { allowed: true }
  | { allowed: false; reason: BookingPolicyViolation; message: string };

function addDays(date: string, days: number): string {
  const parts = parseCivilDate(date);
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return formatCivilDate({
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  });
}

/**
 * Enforces ClinicSettings booking policy on top of the scheduling engine.
 */
export function evaluateBookingPolicy(
  input: BookingPolicyInput,
): BookingPolicyResult {
  const now = input.now ?? new Date();
  const today = utcToCivilDate(now, input.timezone);

  if (input.selectedDate < today) {
    return {
      allowed: false,
      reason: "past-date",
      message: "Cannot book appointments in the past",
    };
  }

  if (!input.rules.allowSameDayBooking && input.selectedDate === today) {
    return {
      allowed: false,
      reason: "same-day-disabled",
      message: "Same-day booking is not allowed",
    };
  }

  const maxDate = addDays(today, input.rules.maxAdvanceDays);
  if (input.selectedDate > maxDate) {
    return {
      allowed: false,
      reason: "too-far-in-advance",
      message: `Appointments can only be booked up to ${input.rules.maxAdvanceDays} days in advance`,
    };
  }

  const leadMs = input.rules.minLeadTimeHours * 60 * 60 * 1000;
  if (input.slotStartAt.getTime() < now.getTime() + leadMs) {
    return {
      allowed: false,
      reason: "lead-time-not-met",
      message: `Appointments must be booked at least ${input.rules.minLeadTimeHours} hours in advance`,
    };
  }

  return { allowed: true };
}
