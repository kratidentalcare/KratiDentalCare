import { formatSlotLabel } from "@/features/appointments/lib/format";
import { utcToCivilDate } from "@/features/scheduling/lib/timezone";

export function formatPatientAppointmentLabel(
  startsAt: Date,
  timezone: string,
): { date: string; timeLabel: string; label: string } {
  const date = utcToCivilDate(startsAt, timezone);
  const timeLabel = formatSlotLabel(startsAt, timezone);
  return {
    date,
    timeLabel,
    label: `${date} · ${timeLabel}`,
  };
}
