import { PageContainer } from "@/components/layout";
import { cn } from "@/lib/utils";

import { HeroContent } from "./hero-content";
import { HeroImage } from "./hero-image";

import "./hero.css";

export type HeroProps = {
  className?: string;
};

/**
 * Mobile: stacked image (top) + copy (bottom).
 * Desktop: full-bleed banner filling the viewport under the sticky navbar.
 */
export function Hero({ className }: HeroProps) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden font-montserrat",
        "bg-brand-surface",
        // Exact height under navbar — avoids a leftover white strip below the banner
        "md:h-[calc(100svh-5.25rem)] md:min-h-[32rem] md:bg-[#eaf2f7]",
        "lg:h-[calc(100svh-6rem)]",
        className
      )}
    >
      <HeroImage variant="desktop" className="hidden md:block" />

      <div className="relative z-10 flex h-full flex-col md:justify-center">
        <HeroImage variant="mobile" className="md:hidden" />

        <PageContainer
          size="xl"
          className={cn(
            "relative flex w-full flex-col items-start",
            // Mobile keeps section rhythm; desktop centers in the full-bleed frame
            "public-section-y md:py-0",
            "md:h-full md:justify-center",
            "md:pl-4 lg:pl-5 xl:pl-6"
          )}
        >
          <HeroContent
            showTrustBadges={false}
            hidePrimaryCtaOnMobile
            className="w-full max-w-xl md:max-w-[42%] xl:max-w-[38%] md:-ml-2 lg:-ml-4 xl:-ml-6"
          />
        </PageContainer>
      </div>
    </section>
  );
}
