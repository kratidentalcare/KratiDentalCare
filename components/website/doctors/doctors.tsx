import { PageContainer } from "@/components/layout";
import { cn } from "@/lib/utils";

import { DoctorCard } from "./doctor-card";
import { DOCTORS } from "./doctors-data";
import { DoctorsSectionHeader } from "./section-header";

export type DoctorsProps = {
  className?: string;
};

/**
 * Homepage “Meet Our Doctor” — soft surface, atmospheric glow, editorial showcase.
 */
export function Doctors({ className }: DoctorsProps) {
  return (
    <section
      id="doctors"
      aria-labelledby="doctors-heading"
      className={cn(
        "relative overflow-hidden bg-brand-surface font-montserrat",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-20 top-16 size-72 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_12%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-96",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-16 bottom-10 size-64 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-red)_7%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-80",
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <DoctorsSectionHeader />

        <ul
          className="mt-10 flex list-none flex-col gap-14 sm:mt-12 lg:mt-14 lg:gap-16"
          aria-label="Our dental specialists"
        >
          {DOCTORS.map((doctor, index) => (
            <li key={doctor.id} className="w-full">
              <DoctorCard doctor={doctor} index={index} />
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
