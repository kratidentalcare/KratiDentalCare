import Image from "next/image";
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
      {/* Top wave — blends from Why Choose Us (brand-surface) */}
      <ServicesWave edge="top" fill="var(--brand-surface)" />

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

      {/* Low-contrast dental marks add depth without competing with content. */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={180}
          height={180}
          className="absolute top-[10%] left-[3%] size-24 -rotate-12 opacity-[0.08] sm:size-32 lg:size-40"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={150}
          height={150}
          className="absolute top-[18%] right-[5%] size-20 rotate-12 opacity-[0.07] sm:size-28 lg:size-32"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={160}
          height={160}
          className="absolute top-[25%] left-[10%] hidden size-28 rotate-[18deg] opacity-[0.06] sm:block lg:size-36"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={180}
          height={180}
          className="absolute right-[8%] bottom-[18%] size-24 -rotate-[16deg] opacity-[0.07] sm:size-32 lg:size-40"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={130}
          height={130}
          className="absolute bottom-[8%] left-[42%] hidden size-24 rotate-6 opacity-[0.05] md:block lg:size-28"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={120}
          height={120}
          className="absolute top-[8%] left-[34%] hidden size-20 -rotate-6 opacity-[0.05] md:block lg:size-24"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={140}
          height={140}
          className="absolute top-[26%] right-[25%] hidden size-24 rotate-[22deg] opacity-[0.06] sm:block lg:size-28"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={130}
          height={130}
          className="absolute bottom-[24%] left-[28%] size-20 -rotate-[20deg] opacity-[0.05] sm:size-24 lg:size-28"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={150}
          height={150}
          className="absolute right-[34%] bottom-[12%] hidden size-24 rotate-12 opacity-[0.05] md:block lg:size-32"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={110}
          height={110}
          className="absolute right-[2%] bottom-[5%] size-16 -rotate-12 opacity-[0.06] sm:size-20 lg:size-24"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={120}
          height={120}
          className="absolute top-[5%] right-[16%] hidden size-20 rotate-[16deg] opacity-[0.05] sm:block lg:size-24"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={110}
          height={110}
          className="absolute top-[29%] left-[52%] hidden size-16 -rotate-[14deg] opacity-[0.05] md:block lg:size-24"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={140}
          height={140}
          className="absolute top-[16%] left-[72%] hidden size-24 rotate-6 opacity-[0.05] lg:block lg:size-28"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={130}
          height={130}
          className="absolute bottom-[4%] left-[12%] hidden size-20 rotate-[20deg] opacity-[0.06] sm:block lg:size-28"
        />
        <Image
          src="/images/teeth-logo-services.png"
          alt=""
          width={120}
          height={120}
          className="absolute right-[52%] bottom-[28%] hidden size-20 -rotate-6 opacity-[0.05] md:block lg:size-24"
        />
      </div>

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
              "shadow-[0_10px_28px_color-mix(in_srgb,black_18%,transparent)]",
              "transition-all duration-300 ease-out",
              "hover:scale-105 hover:bg-white/95 hover:shadow-[0_14px_32px_color-mix(in_srgb,black_22%,transparent)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue",
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

      {/* Bottom wave — blends into Doctors (light canvas) */}
      <ServicesWave
        edge="bottom"
        fill="color-mix(in srgb, var(--brand-blue) 8%, white)"
      />
    </section>
  );
}
