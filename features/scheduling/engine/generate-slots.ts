import {
  AVAILABILITY_STATUSES,
  SCHEDULE_OVERRIDE_TYPES,
  type AppointmentDurationMinutes,
} from "@/constants/scheduling";
import {
  buildCandidateIntervals,
  isBlockedByAny,
  toInterval,
} from "@/features/scheduling/lib/intervals";
import {
  compareCivilDates,
  formatClinicTimeLabel,
  getWeekdayForCivilDate,
  utcToCivilDate,
  zonedDateTimeToUtc,
} from "@/features/scheduling/lib/timezone";
import type {
  AvailabilityResult,
  GenerateSlotsEngineInput,
  GeneratedSlot,
  TimeInterval,
} from "@/features/scheduling/types";

function closedResult(
  input: GenerateSlotsEngineInput,
  status: AvailabilityResult["status"],
  reason: string | null,
  durationMinutes: AppointmentDurationMinutes,
): AvailabilityResult {
  return {
    date: input.date,
    timezone: input.settings.timezone,
    durationMinutes,
    status,
    reason,
    slots: [],
    generatedCount: 0,
    availableCount: 0,
  };
}

/**
 * Pure availability engine — no DB / I/O.
 * Generates bookable slots for one civil date from clinic rules + closures.
 */
export function generateSlotsForDate(
  input: GenerateSlotsEngineInput,
): AvailabilityResult {
  const { settings } = input;
  const durationMinutes =
    input.durationMinutes ?? settings.appointmentDurationMinutes;
  const timezone = settings.timezone;
  const now = input.now ?? new Date();
  const includePastTimes = input.includePastTimes ?? false;

  const todayCivil = utcToCivilDate(now, timezone);
  if (compareCivilDates(input.date, todayCivil) < 0) {
    return closedResult(
      input,
      AVAILABILITY_STATUSES.PAST_DATE,
      "Selected date is in the past",
      durationMinutes,
    );
  }

  const weekday = getWeekdayForCivilDate(input.date, timezone);
  if (!settings.workingDays.includes(weekday)) {
    return closedResult(
      input,
      AVAILABILITY_STATUSES.NON_WORKING_DAY,
      "Clinic Closed",
      durationMinutes,
    );
  }

  if (input.holiday) {
    return closedResult(
      input,
      AVAILABILITY_STATUSES.HOLIDAY,
      input.holiday.reason || "Clinic Closed",
      durationMinutes,
    );
  }

  const overrides = input.overrides ?? [];
  const allDayOverride = overrides.find(
    (item) => item.type === SCHEDULE_OVERRIDE_TYPES.ALL_DAY,
  );
  if (allDayOverride) {
    return closedResult(
      input,
      AVAILABILITY_STATUSES.BLOCKED,
      allDayOverride.reason || "Clinic Closed",
      durationMinutes,
    );
  }

  const dayWindow: TimeInterval = {
    startMs: zonedDateTimeToUtc(
      input.date,
      settings.openingTime,
      timezone,
    ).getTime(),
    endMs: zonedDateTimeToUtc(
      input.date,
      settings.closingTime,
      timezone,
    ).getTime(),
  };

  if (dayWindow.endMs <= dayWindow.startMs) {
    return closedResult(
      input,
      AVAILABILITY_STATUSES.CLINIC_CLOSED,
      "Invalid clinic hours",
      durationMinutes,
    );
  }

  const breakBlockers: TimeInterval[] = settings.breaks.map((item) => ({
    startMs: zonedDateTimeToUtc(input.date, item.startTime, timezone).getTime(),
    endMs: zonedDateTimeToUtc(input.date, item.endTime, timezone).getTime(),
  }));

  const overrideBlockers: TimeInterval[] = overrides
    .filter((item) => item.type === SCHEDULE_OVERRIDE_TYPES.TIME_RANGE)
    .filter((item) => item.startTime != null && item.endTime != null)
    .map((item) => ({
      startMs: zonedDateTimeToUtc(
        input.date,
        item.startTime as string,
        timezone,
      ).getTime(),
      endMs: zonedDateTimeToUtc(
        input.date,
        item.endTime as string,
        timezone,
      ).getTime(),
    }));

  const appointmentBlockers: TimeInterval[] = (input.appointments ?? [])
    .map((appointment) => {
      try {
        return toInterval(appointment.startsAt, appointment.endsAt);
      } catch {
        return null;
      }
    })
    .filter((item): item is TimeInterval => item != null);

  const candidates = buildCandidateIntervals(dayWindow, durationMinutes);
  const afterBreaksAndBlocks = candidates.filter(
    (slot) =>
      !isBlockedByAny(slot, breakBlockers) &&
      !isBlockedByAny(slot, overrideBlockers),
  );

  const afterAppointments = afterBreaksAndBlocks.filter(
    (slot) => !isBlockedByAny(slot, appointmentBlockers),
  );

  const isToday = input.date === todayCivil;
  const nowMs = now.getTime();
  const bookable = afterAppointments.filter((slot) => {
    if (!isToday || includePastTimes) {
      return true;
    }
    return slot.startMs > nowMs;
  });

  if (candidates.length === 0 || afterBreaksAndBlocks.length === 0) {
    return closedResult(
      input,
      AVAILABILITY_STATUSES.CLINIC_CLOSED,
      "Clinic Closed",
      durationMinutes,
    );
  }

  if (bookable.length === 0) {
    return {
      date: input.date,
      timezone,
      durationMinutes,
      status: AVAILABILITY_STATUSES.FULLY_BOOKED,
      reason:
        afterAppointments.length === 0
          ? "No available slots remaining"
          : "No upcoming slots remaining today",
      slots: [],
      generatedCount: afterBreaksAndBlocks.length,
      availableCount: 0,
    };
  }

  const slots: GeneratedSlot[] = bookable.map((slot) => {
    const start = new Date(slot.startMs);
    const end = new Date(slot.endMs);
    return {
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      label: formatClinicTimeLabel(start, timezone),
    };
  });

  return {
    date: input.date,
    timezone,
    durationMinutes,
    status: AVAILABILITY_STATUSES.AVAILABLE,
    reason: null,
    slots,
    generatedCount: afterBreaksAndBlocks.length,
    availableCount: slots.length,
  };
}
