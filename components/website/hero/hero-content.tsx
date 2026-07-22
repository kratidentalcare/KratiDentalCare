import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { TrustBadges } from "./trust-badges";

export type HeroContentProps = {
  className?: string;
  /** Hide when the banner artwork already includes trust indicators. */
  showTrustBadges?: boolean;
  /**
   * Hide booking CTA on mobile when it already appears
   * on the full-screen image overlay.
   */
  hidePrimaryCtaOnMobile?: boolean;
};

/**
 * Left-column copy for the clinic banner.
 * Brand lives in the photo (wall sign) + nav — headline must not compete with either.
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
      <h1
        id="hero-heading"
        className={cn(
          "hero-animate-fade-up hero-delay-1",
          "font-serif text-4xl font-medium leading-[1.08] tracking-tight text-brand-dark",
          "sm:text-5xl lg:text-6xl xl:text-[4.25rem]"
        )}
      >
        <span className="block">Gentle care.</span>
        <span className="block text-brand-blue">Lasting smiles.</span>
      </h1>

      <p
        className={cn(
          "hero-animate-fade-up hero-delay-2",
          "mt-5 max-w-sm text-base leading-relaxed text-brand-muted",
          "sm:mt-6 sm:text-lg"
        )}
      >
        Multi-specialty dental care in Jaipur — precise, personal, and easy to
        book.
      </p>

      <div
        className={cn(
          "hero-animate-fade-up hero-delay-3",
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
          aria-label="Book and Smile"
        >
          Book and Smile
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
        <div className="hero-animate-fade-up hero-delay-4 mt-8 w-full sm:mt-10">
          <TrustBadges />
        </div>
      ) : null}
    </div>
  );
}
