import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { ServiceCard } from "./service-card";
import { SERVICES_PREVIEW } from "./services-data";
import { ServicesHeader } from "./services-header";

export type ServicesProps = {
  className?: string;
};

/**
 * Homepage services preview — header, six-card grid, view-all CTA.
 */
export function Services({ className }: ServicesProps) {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className={cn(
        "relative overflow-hidden bg-brand-surface font-montserrat",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-1/3 -left-24 size-80 rounded-full",
          "bg-gradient-to-br from-brand-blue/15 to-brand-teal/10 blur-3xl",
          "sm:size-[28rem]"
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <ServicesHeader />

        <ul
          className={cn(
            "mt-12 grid list-none grid-cols-1 gap-6",
            "sm:mt-14 sm:grid-cols-2 sm:gap-8",
            "lg:mt-16 lg:grid-cols-3"
          )}
        >
          {SERVICES_PREVIEW.map((service, index) => (
            <li key={service.id} className="min-h-0">
              <ServiceCard serviceId={service.id} index={index} />
            </li>
          ))}
        </ul>

        <div className="mt-14 flex justify-center sm:mt-16">
          <Link
            href={ROUTES.PUBLIC.SERVICES}
            className={cn(
              "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-8",
              "bg-brand-teal text-base font-semibold text-white",
              "shadow-[0_10px_28px_color-mix(in_srgb,var(--brand-teal)_28%,transparent)]",
              "transition-all duration-300 ease-out",
              "hover:scale-105 hover:brightness-105 hover:shadow-[0_14px_32px_color-mix(in_srgb,var(--brand-teal)_34%,transparent)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40 focus-visible:ring-offset-2",
              "active:scale-[0.98]"
            )}
            aria-label="View all dental services"
          >
            View All Services
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
