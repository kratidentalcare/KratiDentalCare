import type { Weekday } from "@/constants/scheduling";
import { WEEKDAYS } from "@/constants/scheduling";
import type { LeanClinicSettings } from "@/models/clinic-settings";

const WEEKDAY_SHORT: Record<Weekday, string> = {
  [WEEKDAYS.MONDAY]: "Monday",
  [WEEKDAYS.TUESDAY]: "Tuesday",
  [WEEKDAYS.WEDNESDAY]: "Wednesday",
  [WEEKDAYS.THURSDAY]: "Thursday",
  [WEEKDAYS.FRIDAY]: "Friday",
  [WEEKDAYS.SATURDAY]: "Saturday",
  [WEEKDAYS.SUNDAY]: "Sunday",
};

const WEEKDAY_ORDER: Weekday[] = [
  WEEKDAYS.MONDAY,
  WEEKDAYS.TUESDAY,
  WEEKDAYS.WEDNESDAY,
  WEEKDAYS.THURSDAY,
  WEEKDAYS.FRIDAY,
  WEEKDAYS.SATURDAY,
  WEEKDAYS.SUNDAY,
];

export function formatClinicTime12h(time: string): string {
  const [hRaw, mRaw] = time.split(":").map(Number);
  const hours = Number.isFinite(hRaw) ? hRaw : 0;
  const minutes = Number.isFinite(mRaw) ? mRaw : 0;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatClinicWorkingDaysLabel(
  workingDays: readonly Weekday[],
): string {
  if (workingDays.length === 0) {
    return "Closed";
  }

  const ordered = WEEKDAY_ORDER.filter((day) => workingDays.includes(day));
  if (ordered.length === 0) {
    return "Closed";
  }

  const ranges: string[] = [];
  let start = ordered[0];
  let prev = ordered[0];

  for (let i = 1; i <= ordered.length; i += 1) {
    const current = ordered[i];
    const prevIndex = WEEKDAY_ORDER.indexOf(prev);
    const currentIndex =
      current != null ? WEEKDAY_ORDER.indexOf(current) : -1;
    const isConsecutive = currentIndex === prevIndex + 1;

    if (!isConsecutive) {
      ranges.push(
        start === prev
          ? WEEKDAY_SHORT[start]
          : `${WEEKDAY_SHORT[start]} – ${WEEKDAY_SHORT[prev]}`,
      );
      if (current) {
        start = current;
        prev = current;
      }
    } else {
      prev = current;
    }
  }

  return ranges.join(", ");
}

export function formatClinicWorkingHours(
  settings: Pick<
    LeanClinicSettings,
    "workingDays" | "openingTime" | "closingTime"
  >,
): string {
  const days = formatClinicWorkingDaysLabel(settings.workingDays);
  if (days === "Closed") {
    return "Closed";
  }
  return `${days} · ${formatClinicTime12h(settings.openingTime)} – ${formatClinicTime12h(settings.closingTime)}`;
}

export function formatClinicAddress(
  address: LeanClinicSettings["address"],
): string {
  const parts = [
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
  ].filter((part): part is string => Boolean(part && part.trim()));

  return parts.join(", ");
}

export function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits || phone}`;
}
