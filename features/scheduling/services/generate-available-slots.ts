import "server-only";

import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { generateSlotsForDate } from "@/features/scheduling/engine/generate-slots";
import {
  civilDateToUtcMidnight,
  zonedDateTimeToUtc,
} from "@/features/scheduling/lib/timezone";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { findHolidayForCivilDate } from "@/features/scheduling/services/holidays";
import { listOverridesForCivilDate } from "@/features/scheduling/services/overrides";
import type { AvailabilityResult } from "@/features/scheduling/types";
import { connect } from "@/lib/db";
import { ValidationError } from "@/lib/errors";
import { Appointment } from "@/models/appointment";
import {
  generateAvailableSlotsQuerySchema,
  type GenerateAvailableSlotsQuery,
} from "@/validators/availability";

export type GenerateAvailableSlotsOptions = Partial<
  Omit<GenerateAvailableSlotsQuery, "date">
> & {
  now?: Date;
};

/**
 * Orchestrates DB lookups + pure engine for one civil date.
 * Safe for admin preview, availability API, and future patient booking.
 *
 * Optional future context:
 * - `doctorId` → doctor-scoped appointment / override filtering
 * - `durationMinutes` → service-specific durations
 * - clinic/branch key → multi-branch settings lookup
 */
export async function generateAvailableSlots(
  selectedDate: string,
  options: GenerateAvailableSlotsOptions = {},
): Promise<AvailabilityResult> {
  const parsed = generateAvailableSlotsQuerySchema.safeParse({
    date: selectedDate,
    doctorId: options.doctorId,
    durationMinutes: options.durationMinutes,
    includePastTimes: options.includePastTimes ?? false,
  });

  if (!parsed.success) {
    throw new ValidationError(
      "Invalid availability query",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  await connect();

  const settings = await getOrCreateClinicSettings();
  const holiday = await findHolidayForCivilDate(parsed.data.date);
  const overrides = await listOverridesForCivilDate(parsed.data.date);

  const dayStart = zonedDateTimeToUtc(
    parsed.data.date,
    "00:00",
    settings.timezone,
  );
  const nextCivil = addOneCivilDay(parsed.data.date);
  const dayEnd = zonedDateTimeToUtc(nextCivil, "00:00", settings.timezone);

  const appointmentFilter: Record<string, unknown> = {
    startsAt: { $lt: dayEnd },
    endsAt: { $gt: dayStart },
    status: {
      $nin: [APPOINTMENT_STATUSES.CANCELLED, APPOINTMENT_STATUSES.ARCHIVED],
    },
  };

  if (parsed.data.doctorId) {
    appointmentFilter.doctorId = parsed.data.doctorId;
  }

  const appointments = await Appointment.find(appointmentFilter)
    .select({ startsAt: 1, endsAt: 1 })
    .lean<Array<{ startsAt: Date; endsAt: Date }>>();

  return generateSlotsForDate({
    date: parsed.data.date,
    settings: {
      timezone: settings.timezone,
      workingDays: settings.workingDays,
      openingTime: settings.openingTime,
      closingTime: settings.closingTime,
      appointmentDurationMinutes: settings.appointmentDurationMinutes,
      breaks: settings.breaks.map((item) => ({
        startTime: item.startTime,
        endTime: item.endTime,
      })),
    },
    holiday: holiday
      ? { reason: holiday.reason, isRecurring: holiday.isRecurring }
      : null,
    overrides: overrides.map((item) => ({
      type: item.type,
      startTime: item.startTime,
      endTime: item.endTime,
      reason: item.reason,
    })),
    appointments,
    now: options.now,
    includePastTimes: parsed.data.includePastTimes,
    durationMinutes: parsed.data.durationMinutes,
  });
}

function addOneCivilDay(date: string): string {
  const utc = civilDateToUtcMidnight(date);
  utc.setUTCDate(utc.getUTCDate() + 1);
  const year = utc.getUTCFullYear();
  const month = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utc.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
