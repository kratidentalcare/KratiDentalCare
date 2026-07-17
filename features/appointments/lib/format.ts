/**
 * Formats an appointment start instant as a clinic-local time label.
 */
export function formatSlotLabel(startAt: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(startAt);
}
