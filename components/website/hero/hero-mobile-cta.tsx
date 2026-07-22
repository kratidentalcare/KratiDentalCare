import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type HeroMobileCtaProps = {
  className?: string;
};

/**
 * Mobile-only bottom panel — short promise + primary CTA.
 * Brand is already in the photo / nav; keep overlay light.
 */
export function HeroMobileCta({ className }: HeroMobileCtaProps) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-10",
        "bg-gradient-to-t from-brand-dark/85 via-brand-dark/40 to-transparent",
        "px-5 pb-7 pt-24",
        "hero-animate-fade-up hero-delay-2",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-5">
        <div className="flex flex-col gap-2 text-left">
          <p className="font-serif text-2xl font-medium leading-snug tracking-tight text-white sm:text-[1.75rem]">
            Gentle care. Lasting smiles.
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-white/85">
            Multi-specialty dental care in Jaipur.
          </p>
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
          aria-label="Book and Smile"
        >
          Book and Smile
        </Link>
      </div>
    </div>
  );
}
