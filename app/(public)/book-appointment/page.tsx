import type { Metadata } from "next";

import { PageContainer } from "@/components/layout";
import { BookingWorkspace } from "@/features/appointments/components/booking-workspace";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { utcToCivilDate } from "@/features/scheduling/lib/timezone";
import { cn } from "@/lib/utils";

import "@/components/website/hero/hero.css";

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
    <section
      aria-labelledby="book-appointment-heading"
      className="relative overflow-hidden bg-brand-surface font-montserrat"
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-24 top-0 size-72 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_14%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-96",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-16 bottom-10 size-64 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-red)_8%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-80",
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p
            className={cn(
              "hero-animate-fade-up hero-delay-1",
              "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-red uppercase",
              "sm:text-xs sm:tracking-[0.2em]",
            )}
          >
            Book &amp; Smile
          </p>
          <h1
            id="book-appointment-heading"
            className={cn(
              "hero-animate-fade-up hero-delay-2",
              "mt-3 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-brand-dark",
              "sm:mt-4 sm:text-4xl lg:text-5xl",
            )}
          >
            Schedule your visit
          </h1>
          <div
            className="hero-animate-fade-up hero-delay-2 mx-auto mt-4 h-1 w-12 rounded-full bg-brand-red"
            aria-hidden
          />
          <p
            className={cn(
              "hero-animate-fade-up hero-delay-3",
              "mt-4 text-sm leading-relaxed text-brand-muted sm:mt-5 sm:text-[0.9375rem]",
            )}
          >
            Pick a date and time, then share your details. Our team will confirm
            your appointment shortly.
          </p>
        </header>

        <div className="hero-animate-fade-up hero-delay-4">
          <BookingWorkspace initialDate={initialDate} />
        </div>
      </PageContainer>
    </section>
  );
}
