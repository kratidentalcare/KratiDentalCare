import { CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";

import { FAQ_SECTION } from "./faq-data";

export type FaqSectionHeaderProps = {
  className?: string;
};

/**
 * Centered FAQ intro — badge, serif headline, supporting copy.
 */
export function FaqSectionHeader({ className }: FaqSectionHeaderProps) {
  return (
    <header
      className={cn(
        "mx-auto flex max-w-2xl flex-col items-center text-center",
        className
      )}
    >
      <p
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-brand-blue/15",
          "bg-white px-3.5 py-1.5",
          "text-[0.6875rem] font-bold tracking-[0.16em] text-brand-blue uppercase",
          "sm:text-xs sm:tracking-[0.18em]"
        )}
      >
        <CircleHelp
          className="size-3.5 shrink-0 text-brand-teal"
          strokeWidth={1.75}
          aria-hidden
        />
        {FAQ_SECTION.badge}
      </p>

      <h2
        id="faq-heading"
        className={cn(
          "mt-5 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
          "sm:mt-6 sm:text-4xl lg:text-5xl"
        )}
      >
        <span className="block">{FAQ_SECTION.heading}</span>
        <span className="block text-brand-blue">{FAQ_SECTION.headingAccent}</span>
      </h2>

      <div className="mt-4 h-1 w-12 rounded-full bg-brand-teal" aria-hidden />

      <p
        className={cn(
          "mt-5 max-w-xl text-sm leading-relaxed text-brand-muted",
          "sm:mt-6 sm:text-[0.9375rem]"
        )}
      >
        {FAQ_SECTION.description}
      </p>
    </header>
  );
}
