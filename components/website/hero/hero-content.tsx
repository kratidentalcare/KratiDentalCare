import Link from "next/link";
import { Star } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { TrustBadges } from "./trust-badges";

export type HeroContentProps = {
  className?: string;
  /** Hide when the banner artwork already includes trust indicators. */
  showTrustBadges?: boolean;
  /**
   * Hide booking CTA + rating on mobile when they already appear
   * on the full-screen image overlay.
   */
  hidePrimaryCtaOnMobile?: boolean;
};

/**
 * Left-column editorial copy: eyebrow, serif headline, rating, CTAs, trust row.
 */
export function HeroContent({
  className,
  showTrustBadges = true,
  hidePrimaryCtaOnMobile = false,
}: HeroContentProps) {
  return (
    <div
      className={cn(
        "relative z-10 flex flex-col items-start justify-center text-left",
        className
      )}
    >
      <p
        className={cn(
          "hero-animate-fade-up hero-delay-1",
          "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-teal uppercase",
          "sm:text-xs sm:tracking-[0.2em]"
        )}
      >
        Trusted by 10,000+ Families Across Jaipur
      </p>

      <h1
        id="hero-heading"
        className={cn(
          "hero-animate-fade-up hero-delay-2",
          "mt-4 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-brand-dark",
          "sm:mt-5 sm:text-5xl lg:text-6xl xl:text-7xl"
        )}
      >
        <span className="block">Transform Your Smile with</span>
        <span className="block text-brand-blue">Expert Dental Care</span>
      </h1>

      <div
        className={cn(
          "hero-animate-fade-up hero-delay-3",
          "mt-6 flex flex-col items-start gap-2 sm:mt-8",
          hidePrimaryCtaOnMobile && "max-md:hidden"
        )}
      >
        <span className="flex items-center gap-0.5 text-brand-dark" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="size-3.5 fill-current sm:size-4"
              strokeWidth={0}
            />
          ))}
        </span>
        <a
          href="https://www.google.com/maps"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-sm font-medium text-brand-dark underline decoration-brand-dark/40 underline-offset-4",
            "transition-colors hover:text-brand-blue hover:decoration-brand-blue/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
          )}
          aria-label="Read 4.9 Google Rating reviews"
        >
          4.9 Google Rating
        </a>
      </div>

      <div
        className={cn(
          "hero-animate-fade-up hero-delay-5",
          "mt-8 flex w-full flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6"
        )}
      >
        <Link
          href={ROUTES.PUBLIC.BOOK}
          className={cn(
            "hero-btn-lift inline-flex h-12 w-full items-center justify-center rounded-full px-8",
            "bg-brand-blue text-base font-semibold text-white",
            "shadow-[0_10px_28px_color-mix(in_srgb,var(--brand-blue)_28%,transparent)]",
            "transition-all duration-200",
            "hover:bg-[#0870A8]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
            "sm:w-auto",
            hidePrimaryCtaOnMobile && "max-md:hidden"
          )}
          aria-label="Book and smile — schedule an appointment"
        >
          Book &amp; Smile
        </Link>

        <Link
          href={ROUTES.PUBLIC.SERVICES}
          className={cn(
            "inline-flex min-h-12 w-full items-center justify-center text-base font-medium text-brand-dark sm:w-auto sm:justify-start",
            "underline decoration-brand-dark/35 underline-offset-[6px]",
            "transition-colors hover:text-brand-blue hover:decoration-brand-blue/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
          )}
          aria-label="Explore dental services"
        >
          Explore Services
        </Link>
      </div>

      {showTrustBadges ? (
        <div className="hero-animate-fade-up hero-delay-6 mt-8 w-full sm:mt-10">
          <TrustBadges />
        </div>
      ) : null}
    </div>
  );
}
