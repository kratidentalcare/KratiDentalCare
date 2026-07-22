import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { DOCTORS_PAGE } from "./doctors-page-data";
import { DoctorsPageBreadcrumb } from "./doctors-page-breadcrumb";

export type DoctorsPageHeroProps = {
  className?: string;
};

/**
 * Doctors page intro — breadcrumb, serif headline, short copy, book CTA.
 * Mirrors Services page hero tokens without redesigning the brand look.
 */
export function DoctorsPageHero({ className }: DoctorsPageHeroProps) {
  return (
    <section
      aria-labelledby="doctors-page-heading"
      className={cn(
        "relative overflow-hidden bg-brand-surface font-montserrat",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-0 right-0 size-72 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_14%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-[28rem]"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-16 -left-12 size-64 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-teal)_12%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-80"
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <DoctorsPageBreadcrumb className="mb-6 sm:mb-8" />

          <p
            className={cn(
              "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-teal uppercase",
              "sm:text-xs sm:tracking-[0.2em]"
            )}
          >
            {DOCTORS_PAGE.eyebrow}
          </p>

          <h1
            id="doctors-page-heading"
            className={cn(
              "mt-4 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-brand-dark",
              "sm:mt-5 sm:text-5xl lg:text-6xl"
            )}
          >
            <span className="block">{DOCTORS_PAGE.heading}</span>
            <span className="block text-brand-blue">
              {DOCTORS_PAGE.headingAccent}
            </span>
          </h1>

          <div className="mt-4 h-1 w-12 rounded-full bg-brand-teal" aria-hidden />

          <p
            className={cn(
              "mt-5 max-w-xl text-sm leading-relaxed text-brand-muted",
              "sm:mt-6 sm:text-[0.9375rem]"
            )}
          >
            {DOCTORS_PAGE.description}
          </p>

          <Link
            href={ROUTES.PUBLIC.BOOK}
            className={cn(
              "group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full px-8",
              "sm:mt-10",
              "bg-brand-blue text-base font-semibold text-white",
              "shadow-[0_10px_28px_color-mix(in_srgb,var(--brand-blue)_28%,transparent)]",
              "transition-all duration-300 ease-out",
              "hover:bg-[#0870A8] hover:shadow-[0_14px_32px_color-mix(in_srgb,var(--brand-blue)_34%,transparent)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
              "active:scale-[0.98]"
            )}
            aria-label="Book a dental appointment"
          >
            {DOCTORS_PAGE.ctaLabel}
            <ArrowRight
              className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
