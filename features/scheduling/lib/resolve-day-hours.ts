import { WEEKDAYS, type Weekday } from "@/constants/scheduling";

export type DayHoursSettings = {
  openingTime: string;
  closingTime: string;
  sundayClosingTime?: string | null;
  workingDays?: readonly Weekday[];
};

export type ResolvedDayHours = {
  openingTime: string;
  closingTime: string;
};

/**
 * Resolve effective opening/closing for a weekday.
 * Sunday uses `sundayClosingTime` when Sunday is a working day.
 */
export function resolveDayHours(
  settings: DayHoursSettings,
  weekday: Weekday,
): ResolvedDayHours {
  const openingTime = settings.openingTime;
  const isSundayOpen =
    weekday === WEEKDAYS.SUNDAY &&
    (settings.workingDays?.includes(WEEKDAYS.SUNDAY) ?? true);

  if (isSundayOpen && settings.sundayClosingTime) {
    return {
      openingTime,
      closingTime: settings.sundayClosingTime,
    };
  }

  return {
    openingTime,
    closingTime: settings.closingTime,
  };
}
