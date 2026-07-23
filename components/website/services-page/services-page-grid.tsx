import { Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { cn } from "@/lib/utils";

import { SERVICES_CATALOG } from "./services-catalog-data";
import { ServiceDetailCard } from "./service-detail-card";

export type ServicesPageGridProps = {
  className?: string;
};

/**
 * Full services catalog grid — white cards on brand-surface canvas.
 */
export function ServicesPageGrid({ className }: ServicesPageGridProps) {
  return (
    <section
      id="services-catalog"
      aria-labelledby="services-catalog-heading"
      className={cn(
        "relative overflow-hidden bg-white font-montserrat",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-0 right-0 size-[26rem] translate-x-1/4 -translate-y-1/4 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_7%,transparent)_0%,transparent_70%)]",
          "blur-3xl"
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-brand-blue/15",
              "bg-brand-surface px-3.5 py-1.5",
              "text-[0.6875rem] font-bold tracking-[0.16em] text-brand-red uppercase",
              "sm:text-xs sm:tracking-[0.18em]"
            )}
          >
            <Sparkles
              className="size-3.5 shrink-0 text-brand-teal"
              strokeWidth={1.75}
              aria-hidden
            />
            Full Catalog
          </p>

          <h2
            id="services-catalog-heading"
            className={cn(
              "mt-5 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
              "sm:mt-6 sm:text-4xl lg:text-5xl"
            )}
          >
            <span className="block">Treatments Tailored</span>
            <span className="block text-brand-blue">to Your Needs</span>
          </h2>

          <div className="mt-4 h-1 w-12 rounded-full bg-brand-red" aria-hidden />

          <p
            className={cn(
              "mt-5 max-w-xl text-sm leading-relaxed text-brand-muted",
              "sm:mt-6 sm:text-[0.9375rem]"
            )}
          >
            Explore every specialty under one roof — each designed for comfort,
            clarity and clinically trusted outcomes.
          </p>
        </header>

        <ul
          className={cn(
            "mt-10 grid list-none grid-cols-1 gap-5",
            "sm:mt-14 sm:grid-cols-2 sm:gap-6",
            "lg:mt-16 lg:grid-cols-3 lg:gap-8"
          )}
          aria-label="Dental services"
        >
          {SERVICES_CATALOG.map((service, index) => (
            <li key={service.id} className="min-h-0">
              <ServiceDetailCard serviceId={service.id} index={index} />
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
