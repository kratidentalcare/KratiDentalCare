import Link from "next/link";
import { Stethoscope } from "lucide-react";

import { PageContainer } from "@/components/layout";
import type { PublicDoctorProfile } from "@/features/doctors";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { DoctorProfile } from "./doctor-profile";
import { DOCTORS_PAGE } from "./doctors-page-data";

export type DoctorsDirectoryProps = {
  doctors: readonly PublicDoctorProfile[];
  clinicHoursLabel?: string | null;
  className?: string;
};

/**
 * Multi-doctor-ready directory — one full profile block per doctor.
 * Adding doctors only grows the list; layout stays unchanged.
 */
export function DoctorsDirectory({
  doctors,
  clinicHoursLabel,
  className,
}: DoctorsDirectoryProps) {
  return (
    <section
      id="doctor-profiles"
      aria-labelledby="doctor-profiles-heading"
      className={cn(
        "relative overflow-hidden font-montserrat",
        "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-blue)_6%,white)_0%,var(--brand-surface)_50%,white_100%)]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-24 -left-28 size-[28rem] rounded-full",
          "border border-brand-blue/[0.07]",
          "sm:size-[36rem]"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-32 -bottom-40 size-[32rem] rounded-full",
          "border border-brand-blue/[0.06]",
          "sm:size-[40rem]"
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <header className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center sm:mb-12">
          <p
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-brand-blue/15",
              "bg-white px-3.5 py-1.5",
              "text-[0.6875rem] font-bold tracking-[0.16em] text-brand-blue uppercase",
              "sm:text-xs sm:tracking-[0.18em]"
            )}
          >
            <Stethoscope
              className="size-3.5 shrink-0 text-brand-blue"
              strokeWidth={1.75}
              aria-hidden
            />
            Profiles
          </p>

          <h2
            id="doctor-profiles-heading"
            className={cn(
              "mt-5 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
              "sm:mt-6 sm:text-4xl"
            )}
          >
            {doctors.length > 1 ? "Our Doctors" : "Doctor Profile"}
          </h2>

          <div className="mt-4 h-1 w-12 rounded-full bg-brand-blue" aria-hidden />
        </header>

        {doctors.length === 0 ? (
          <div
            className={cn(
              "mx-auto max-w-lg rounded-3xl border border-brand-blue/10 bg-white",
              "px-6 py-12 text-center shadow-sm sm:px-10"
            )}
          >
            <h3 className="font-serif text-2xl font-medium text-brand-dark">
              {DOCTORS_PAGE.emptyTitle}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted">
              {DOCTORS_PAGE.emptyDescription}
            </p>
            <Link
              href={ROUTES.PUBLIC.BOOK}
              className={cn(
                "mt-6 inline-flex h-11 items-center justify-center rounded-full px-6",
                "bg-brand-blue text-sm font-semibold text-white",
                "transition-colors hover:bg-[#0870A8]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
              )}
            >
              Book and Smile
            </Link>
          </div>
        ) : (
          <ul
            className="flex list-none flex-col gap-10 lg:gap-14"
            aria-label="Clinic doctors"
          >
            {doctors.map((doctor, index) => (
              <li key={doctor.id}>
                <DoctorProfile
                  doctor={doctor}
                  clinicHoursLabel={clinicHoursLabel}
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </section>
  );
}
