import type { Metadata } from "next";

import { BookingWorkspace } from "@/features/appointments/components/booking-workspace";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { utcToCivilDate } from "@/features/scheduling/lib/timezone";

export const metadata: Metadata = {
  title: "Book and Smile",
  description:
    "Schedule a dental appointment online. Choose an available time and submit your details.",
};

/**
 * Public guest booking page.
 */
export default async function BookAppointmentPage() {
  const settings = await getOrCreateClinicSettings();
  const initialDate = utcToCivilDate(new Date(), settings.timezone);

  return (
    <section className="bg-[#F8FAFC] py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-semibold text-brand-dark sm:text-4xl">
            Book an Appointment
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select a date and time, then share your contact details. Our team
            will confirm your visit.
          </p>
        </div>
        <BookingWorkspace initialDate={initialDate} />
      </div>
    </section>
  );
}
