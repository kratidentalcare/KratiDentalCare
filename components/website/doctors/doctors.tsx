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
      {/* Faint large decorative rings */}
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
      <div
        className={cn(
          "pointer-events-none absolute top-1/3 left-[18%] size-64 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_12%,transparent)_0%,transparent_70%)]",
          "blur-2xl"
        )}
        aria-hidden
      />

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
