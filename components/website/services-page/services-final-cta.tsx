import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type ServicesFinalCtaProps = {
  phone?: string | null;
  phoneHref?: string | null;
  className?: string;
};

/**
 * Closing conversion band — book online or call the clinic.
 */
export function ServicesFinalCta({
  phone,
  phoneHref,
  className,
}: ServicesFinalCtaProps) {
  const canCall = Boolean(phone && phoneHref);

  return (
    <section
      aria-labelledby="services-final-cta-heading"
      className={cn(
        "relative overflow-hidden font-montserrat",
        "bg-[linear-gradient(160deg,#071833_0%,#0a1f44_45%,#0d4578_100%)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_srgb,var(--brand-blue)_18%,transparent)_0%,transparent_60%)]"
        aria-hidden
      />
      <PageContainer size="xl" className="relative z-10 public-section-y">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2
            id="services-final-cta-heading"
            className={cn(
              "font-serif text-3xl font-medium leading-[1.12] tracking-tight text-white",
              "sm:text-4xl lg:text-5xl"
            )}
          >
            Begin your healthier smile
          </h2>

          <p
            className={cn(
              "mt-4 max-w-md text-sm leading-relaxed text-white/85",
              "sm:mt-5 sm:text-[0.9375rem]"
            )}
          >
            Book online in minutes, or call — we&apos;ll guide you with clarity
            and comfort.
          </p>

          <div
            className={cn(
              "mt-8 flex w-full flex-col items-stretch gap-3 sm:mt-10",
              "sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4"
            )}
          >
            <Link
              href={ROUTES.PUBLIC.BOOK}
              className={cn(
                "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-8",
                "bg-brand-blue text-base font-semibold text-white",
                "shadow-[0_10px_28px_color-mix(in_srgb,var(--brand-blue)_40%,transparent)]",
                "transition-colors duration-200",
                "hover:bg-brand-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy",
                "active:scale-[0.98]"
              )}
              aria-label="Book and Smile"
            >
              Book and Smile
              <ArrowRight
                className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </Link>

            {canCall ? (
              <a
                href={phoneHref!}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-8",
                  "border border-white/35 bg-transparent text-base font-semibold text-white",
                  "transition-colors duration-200",
                  "hover:border-white/60 hover:bg-white/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy",
                  "active:scale-[0.98]"
                )}
                aria-label={`Call clinic at ${phone}`}
              >
                <Phone className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Call Clinic
              </a>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
