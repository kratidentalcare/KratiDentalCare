/**
 * Browser-safe civil date helpers for calendar pickers.
 * Uses local Y/M/D components of the clicked day (admin UI).
 */

export function dateToCivilString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function civilStringToDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatCivilDateLabel(value: string): string {
  const date = civilStringToDate(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    weekday: "short",
  }).format(date);
}
