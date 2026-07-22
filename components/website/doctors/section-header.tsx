import { cn } from "@/lib/utils";

import { DOCTORS_SECTION } from "./doctors-data";

export type DoctorsSectionHeaderProps = {
  className?: string;
};

/**
 * Optional standalone section intro (left-aligned).
 * Primary homepage layout embeds this inside DoctorCard via showIntro.
 */
export function DoctorsSectionHeader({ className }: DoctorsSectionHeaderProps) {
  return (
    <header className={cn("flex max-w-2xl flex-col items-start text-left", className)}>
      <p
        className={cn(
          "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-blue uppercase",
          "sm:text-xs sm:tracking-[0.2em]"
        )}
      >
        {DOCTORS_SECTION.badge}
      </p>

      <h2
        id="doctors-heading"
        className={cn(
          "mt-5 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
          "sm:mt-6 sm:text-4xl lg:text-5xl"
        )}
      >
        <span className="block">{DOCTORS_SECTION.heading}</span>
        <span className="block text-brand-blue">{DOCTORS_SECTION.headingAccent}</span>
      </h2>

      <p
        className={cn(
          "mt-5 max-w-lg text-sm leading-relaxed text-brand-muted",
          "sm:mt-6 sm:text-[0.9375rem]"
        )}
      >
        {DOCTORS_SECTION.description}
      </p>
    </header>
  );
}
