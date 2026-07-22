import Link from "next/link";
import { Star } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type HeroMobileCtaProps = {
  className?: string;
  /** Clinic Google Maps / reviews URL from ClinicSettings. */
  mapsUrl?: string | null;
};

/**
 * Mobile-only bottom panel on the hero image — short line + primary booking CTA.
 * Fills empty vertical space without covering the clinic branding in the photo.
 */
export function HeroMobileCta({ className, mapsUrl = null }: HeroMobileCtaProps) {
  const ratingHref = mapsUrl?.trim() || null;

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-10",
        "bg-gradient-to-t from-brand-dark/85 via-brand-dark/45 to-transparent",
        "px-5 pb-7 pt-20",
        "hero-animate-fade-up hero-delay-3",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-4">
        <div className="flex flex-col gap-1.5 text-left">
          <p className="text-[0.6875rem] font-medium tracking-[0.16em] text-white/80 uppercase">
            Jaipur&apos;s Trusted Dental Clinic
          </p>
          <p className="font-serif text-2xl font-medium leading-snug tracking-tight text-white">
            Book your smile makeover today
          </p>
          {ratingHref ? (
            <a
              href={ratingHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-white/90",
                "underline decoration-white/35 underline-offset-4",
                "transition-colors hover:text-white hover:decoration-white/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark/40"
              )}
              aria-label="Read 4.9 Google Rating reviews"
            >
              <span className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="size-3 fill-current"
                    strokeWidth={0}
                  />
                ))}
              </span>
              4.9 Google Rating
            </a>
          ) : (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-white/90">
              <span className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="size-3 fill-current"
                    strokeWidth={0}
                  />
                ))}
              </span>
              4.9 Google Rating
            </p>
          )}
        </div>

        <Link
          href={ROUTES.PUBLIC.BOOK}
          className={cn(
            "hero-btn-lift inline-flex h-12 w-full items-center justify-center rounded-full px-8",
            "bg-brand-blue text-base font-semibold text-white",
            "shadow-[0_12px_28px_rgba(0,0,0,0.28)]",
            "transition-all duration-200",
            "hover:bg-[#0870A8]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark/40",
            "active:scale-[0.98]"
          )}
          aria-label="Book an appointment"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
}
