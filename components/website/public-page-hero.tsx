import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import "@/components/website/hero/hero.css";

export type PublicPageHeroProps = {
  id: string;
  eyebrow: string;
  heading: string;
  headingAccent: string;
  description: string;
  ctaLabel: string;
  breadcrumb: ReactNode;
  imageSrc: string;
  imageAlt: string;
  /** Focal point for object-position (e.g. doctor portraits). */
  imagePosition?: string;
  className?: string;
};

/**
 * Inner-page marketing hero — full-bleed photo filling the viewport under the navbar.
 * Shared by Services, Doctors, and Contact so the look stays consistent.
 */
export function PublicPageHero({
  id,
  eyebrow,
  heading,
  headingAccent,
  description,
  ctaLabel,
  breadcrumb,
  imageSrc,
  imageAlt,
  imagePosition = "object-center",
  className,
}: PublicPageHeroProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "relative isolate overflow-hidden bg-brand-dark font-montserrat",
        // Exact height under navbar (mobile → desktop) — no leftover strip
        "h-[calc(100svh-4.75rem)] min-h-[22rem]",
        "sm:h-[calc(100svh-5.25rem)] sm:min-h-[26rem]",
        "lg:h-[calc(100svh-6rem)] lg:min-h-[28rem]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className={cn("object-cover", imagePosition)}
        />
      </div>

      {/* Left-weighted scrim — keeps type readable without covering the whole photo */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-gradient-to-r from-brand-dark/88 via-brand-dark/55 to-brand-dark/20",
          "sm:via-brand-dark/50 sm:to-transparent"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-gradient-to-t from-brand-dark/35 via-transparent to-brand-dark/25"
        )}
        aria-hidden
      />

      <PageContainer
        size="xl"
        className={cn(
          "relative z-10 flex h-full flex-col justify-center",
          "public-section-y md:py-10 lg:py-12"
        )}
      >
        <div className="flex max-w-xl flex-col items-start text-left">
          <div className="hero-animate-fade-up hero-delay-1">{breadcrumb}</div>

          <p
            className={cn(
              "hero-animate-fade-up hero-delay-1",
              "mt-5 text-[0.6875rem] font-medium tracking-[0.18em] text-white/75 uppercase",
              "sm:mt-6 sm:text-xs sm:tracking-[0.2em]"
            )}
          >
            {eyebrow}
          </p>

          <h1
            id={id}
            className={cn(
              "hero-animate-fade-up hero-delay-2",
              "mt-3 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-white",
              "sm:mt-4 sm:text-5xl lg:text-6xl"
            )}
          >
            <span className="block">{heading}</span>
            <span className="block text-[#8ecae6]">{headingAccent}</span>
          </h1>

          <p
            className={cn(
              "hero-animate-fade-up hero-delay-3",
              "mt-4 max-w-md text-sm leading-relaxed text-white/80",
              "sm:mt-5 sm:text-[0.9375rem]"
            )}
          >
            {description}
          </p>

          <Link
            href={ROUTES.PUBLIC.BOOK}
            className={cn(
              "hero-animate-fade-up hero-delay-3 hero-btn-lift",
              "group mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full px-8",
              "sm:mt-8",
              "bg-brand-blue text-base font-semibold text-white",
              "shadow-[0_10px_28px_rgba(0,0,0,0.28)]",
              "transition-colors duration-200",
              "hover:bg-[#0870A8]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark/40",
              "active:scale-[0.98]"
            )}
            aria-label={ctaLabel}
          >
            {ctaLabel}
            <ArrowRight
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
