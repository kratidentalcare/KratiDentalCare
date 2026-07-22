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
        "relative overflow-hidden bg-brand-blue font-montserrat",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-1/4 -left-24 size-80 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,white_18%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-[28rem]"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-20 bottom-0 size-72 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-teal)_45%,transparent)_0%,transparent_70%)]",
          "blur-3xl sm:size-96"
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative z-10 public-section-y">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p
            className={cn(
              "text-[0.6875rem] font-medium tracking-[0.18em] text-white/85 uppercase",
              "sm:text-xs sm:tracking-[0.2em]"
            )}
          >
            Ready When You Are
          </p>

          <h2
            id="services-final-cta-heading"
            className={cn(
              "mt-4 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-white",
              "sm:mt-5 sm:text-4xl lg:text-5xl"
            )}
          >
            Begin Your Healthier Smile Today
          </h2>

          <p
            className={cn(
              "mt-4 max-w-lg text-sm leading-relaxed text-white/85",
              "sm:mt-5 sm:text-[0.9375rem]"
            )}
          >
            Book online in minutes, or call our team — we&apos;ll guide you to the
            right care with clarity and comfort.
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
                "bg-white text-base font-semibold text-brand-blue",
                "shadow-[0_10px_28px_color-mix(in_srgb,black_18%,transparent)]",
                "transition-all duration-300 ease-out",
                "hover:scale-105 hover:bg-white/95 hover:shadow-[0_14px_32px_color-mix(in_srgb,black_22%,transparent)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue",
                "active:scale-[0.98]"
              )}
              aria-label="Book a dental appointment"
            >
              Book Appointment
              <ArrowRight
                className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </Link>

            {canCall ? (
              <a
                href={phoneHref!}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-8",
                  "border border-white/35 bg-transparent text-base font-semibold text-white",
                  "transition-all duration-300 ease-out",
                  "hover:border-white/60 hover:bg-white/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue",
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
