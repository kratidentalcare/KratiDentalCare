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
 * Soft wave divider — previous/next section color cutting into brand-blue.
 */
function ServicesWave({
  edge,
  fill,
}: {
  edge: "top" | "bottom";
  fill: string;
}) {
  const isTop = edge === "top";

  return (
    <div
      className={cn(
        "pointer-events-none relative z-10 w-full leading-[0]",
        isTop ? "-mb-px" : "-mt-px"
      )}
      aria-hidden
    >
      <svg
        className="block h-16 w-full sm:h-24 lg:h-28"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isTop ? (
          <path
            fill={fill}
            d="M0,0 L1440,0 L1440,36 C1200,108 960,12 720,60 C480,108 240,18 0,72 Z"
          />
        ) : (
          <path
            fill={fill}
            d="M0,72 C240,18 480,108 720,60 C960,12 1200,108 1440,36 L1440,120 L0,120 Z"
          />
        )}
      </svg>
    </div>
  );
}

/**
 * Homepage services preview — header, mobile carousel / desktop grid, CTA.
 */
export function Services({ className }: ServicesProps) {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className={cn(
        "relative overflow-hidden bg-brand-blue font-montserrat",
        className
      )}
    >
      <ServicesWave edge="top" fill="var(--brand-surface)" />

      <PageContainer size="xl" className="relative z-10 public-section-y">
        <ServicesHeader />

        {/*
          Mobile: horizontal snap carousel (short vertical scroll).
          sm+: responsive card grid.
        */}
        <ul
          className={cn(
            "mt-8 flex list-none gap-4 overflow-x-auto pb-2",
            "snap-x snap-mandatory scroll-smooth",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            "sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:pb-0 sm:snap-none",
            "lg:mt-16 lg:grid-cols-3"
          )}
          aria-label="Dental services preview"
        >
          {SERVICES_PREVIEW.map((service, index) => (
            <li
              key={service.id}
              className={cn(
                "w-[min(78vw,17.5rem)] shrink-0 snap-center",
                "sm:w-auto sm:min-h-0 sm:shrink sm:snap-none"
              )}
            >
              <ServiceCard serviceId={service.id} index={index} />
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center sm:mt-16">
          <Link
            href={ROUTES.PUBLIC.SERVICES}
            className={cn(
              "group inline-flex h-11 items-center justify-center gap-2 rounded-full px-7",
              "sm:h-12 sm:px-8",
              "bg-white text-sm font-semibold text-brand-blue sm:text-base",
              "transition-colors duration-200",
              "hover:bg-white/95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue",
              "active:scale-[0.98]"
            )}
            aria-label="View all dental services"
          >
            View All Services
            <ArrowRight
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </PageContainer>

      <ServicesWave
        edge="bottom"
        fill="color-mix(in srgb, var(--brand-blue) 8%, white)"
      />
    </section>
  );
}
