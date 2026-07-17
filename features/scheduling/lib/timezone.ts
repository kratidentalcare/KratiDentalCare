import { JS_WEEKDAY_TO_WEEKDAY, type Weekday } from "@/constants/scheduling";

/**
 * Timezone-safe civil date helpers.
 * All scheduling math interprets `YYYY-MM-DD` in the clinic IANA timezone
 * and converts boundaries to UTC instants — never relying on server local TZ.
 */

const CIVIL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type CivilDateParts = {
  year: number;
  month: number;
  day: number;
};

export function parseCivilDate(date: string): CivilDateParts {
  const match = CIVIL_DATE_RE.exec(date);
  if (!match) {
    throw new Error(`Invalid civil date: ${date}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Validate calendar day via UTC construction round-trip.
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    throw new Error(`Invalid civil date: ${date}`);
  }

  return { year, month, day };
}

export function formatCivilDate(parts: CivilDateParts): string {
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

export function parseTimeOfDay(time: string): { hours: number; minutes: number } {
  const match = TIME_RE.exec(time);
  if (!match) {
    throw new Error(`Invalid time of day: ${time}`);
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

export function timeOfDayToMinutes(time: string): number {
  const { hours, minutes } = parseTimeOfDay(time);
  return hours * 60 + minutes;
}

/**
 * Offset of `timeZone` at the given UTC instant, in milliseconds.
 * Positive means local clock is ahead of UTC (e.g. Asia/Kolkata → +19800000).
 */
export function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  let hour = Number(map.hour);
  if (hour === 24) {
    hour = 0;
  }

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second),
  );

  return asUtc - date.getTime();
}

/**
 * Convert a clinic-local civil date + clock time to a UTC `Date`.
 */
export function zonedDateTimeToUtc(
  date: string,
  time: string,
  timeZone: string,
): Date {
  const { year, month, day } = parseCivilDate(date);
  const { hours, minutes } = parseTimeOfDay(time);

  // Initial guess: treat local components as if they were UTC, then correct.
  let utcMs = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const offset1 = getTimeZoneOffsetMs(new Date(utcMs), timeZone);
  utcMs -= offset1;

  // DST / transition correction (no-op for Asia/Kolkata).
  const offset2 = getTimeZoneOffsetMs(new Date(utcMs), timeZone);
  if (offset2 !== offset1) {
    utcMs = Date.UTC(year, month - 1, day, hours, minutes, 0, 0) - offset2;
  }

  return new Date(utcMs);
}

/**
 * Civil `YYYY-MM-DD` for an instant in the given timezone.
 */
export function utcToCivilDate(date: Date, timeZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA yields YYYY-MM-DD
  return dtf.format(date);
}

/**
 * Weekday name for a civil date in the clinic timezone.
 */
export function getWeekdayForCivilDate(
  date: string,
  timeZone: string,
): Weekday {
  const noonUtc = zonedDateTimeToUtc(date, "12:00", timeZone);
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  });
  const short = dtf.format(noonUtc);
  const map: Record<string, Weekday> = {
    Sun: JS_WEEKDAY_TO_WEEKDAY[0],
    Mon: JS_WEEKDAY_TO_WEEKDAY[1],
    Tue: JS_WEEKDAY_TO_WEEKDAY[2],
    Wed: JS_WEEKDAY_TO_WEEKDAY[3],
    Thu: JS_WEEKDAY_TO_WEEKDAY[4],
    Fri: JS_WEEKDAY_TO_WEEKDAY[5],
    Sat: JS_WEEKDAY_TO_WEEKDAY[6],
  };
  const weekday = map[short];
  if (!weekday) {
    throw new Error(`Unable to resolve weekday for ${date} (${timeZone})`);
  }
  return weekday;
}

/**
 * Format a UTC instant as clinic-local 12h clock, e.g. `10:00 AM`.
 */
export function formatClinicTimeLabel(
  instant: Date,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instant);
}

/**
 * UTC midnight Date for a civil date (Holiday / ScheduleOverride storage).
 */
export function civilDateToUtcMidnight(date: string): Date {
  const { year, month, day } = parseCivilDate(date);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Format a stored UTC-midnight Date back to civil `YYYY-MM-DD`.
 */
export function utcMidnightToCivilDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function compareCivilDates(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
