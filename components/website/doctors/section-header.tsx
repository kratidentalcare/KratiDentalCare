import { cn } from "@/lib/utils";

import { DOCTORS_SECTION } from "./doctors-data";

export type DoctorsSectionHeaderProps = {
  className?: string;
};

/**
 * Centered section intro — eyebrow, serif headline, accent bar, supporting copy.
 */
export function DoctorsSectionHeader({ className }: DoctorsSectionHeaderProps) {
  return (
    <header
      className={cn(
        "mx-auto flex max-w-2xl flex-col items-center text-center",
        className,
      )}
    >
      <p
        className={cn(
          "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-red uppercase",
          "sm:text-xs sm:tracking-[0.2em]",
        )}
      >
        {DOCTORS_SECTION.badge}
      </p>

      <h2
        id="doctors-heading"
        className={cn(
          "mt-5 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
          "sm:mt-6 sm:text-4xl lg:text-5xl",
        )}
      >
        <span className="block">{DOCTORS_SECTION.heading}</span>
        <span className="block text-brand-blue">
          {DOCTORS_SECTION.headingAccent}
        </span>
      </h2>

      <div className="mt-5 h-1 w-12 rounded-full bg-brand-red" aria-hidden />

      <p
        className={cn(
          "mt-5 max-w-xl text-sm leading-relaxed text-brand-muted",
          "sm:mt-6 sm:text-[0.9375rem]",
        )}
      >
        {DOCTORS_SECTION.description}
      </p>
    </header>
  );
}
