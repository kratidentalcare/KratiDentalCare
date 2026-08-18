import { BookingWorkspace } from "@/features/appointments/components/booking-workspace";
import { utcToCivilDate } from "@/features/scheduling/lib/timezone";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";

/**
 * Timezone-aware booking form streamed so the page heading paints first.
 */
export async function StreamedBookingWorkspace() {
  const settings = await getOrCreateClinicSettings();
  const initialDate = utcToCivilDate(new Date(), settings.timezone);

  return <BookingWorkspace initialDate={initialDate} />;
}
