import { PageContainer } from "@/components/layout";
import { cn } from "@/lib/utils";

import { DoctorCard } from "./doctor-card";
import { DOCTORS } from "./doctors-data";

export type DoctorsProps = {
  className?: string;
};

/**
 * Homepage “Meet Our Doctor” — soft blue gradient canvas + asymmetric showcase.
 */
export function Doctors({ className }: DoctorsProps) {
  return (
    <section
      id="doctors"
      aria-labelledby="doctors-heading"
      className={cn(
        "relative overflow-hidden font-montserrat",
        "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-blue)_8%,white)_0%,var(--brand-surface)_55%,white_100%)]",
        className
      )}
    >
      <PageContainer size="xl" className="relative public-section-y">
        <ul
          className="flex list-none flex-col gap-14 lg:gap-16"
          aria-label="Our dental specialists"
        >
          {DOCTORS.map((doctor, index) => (
            <li key={doctor.id} className="w-full">
              <DoctorCard
                doctor={doctor}
                index={index}
                showIntro={index === 0}
              />
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
