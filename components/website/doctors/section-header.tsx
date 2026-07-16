import { Stethoscope } from "lucide-react";

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

      <div className="mt-4 h-1 w-12 rounded-full bg-brand-blue" aria-hidden />

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
