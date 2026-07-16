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
 * Desktop: full-bleed banner with copy overlaid on the left panel.
 */
export function Hero({ className }: HeroProps) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden font-montserrat",
        "bg-brand-surface md:bg-transparent",
        "md:min-h-[min(36rem,calc(100svh-6.5rem))]",
        className
      )}
    >
      {/* Desktop: absolute full-bleed background */}
      <HeroImage variant="desktop" className="hidden md:block" />

      <div className="relative z-10 flex flex-col md:min-h-[inherit] md:justify-center">
        {/* Mobile: image sits above the copy */}
        <HeroImage variant="mobile" className="md:hidden" />

        <PageContainer
          size="xl"
          className={cn(
            "relative flex w-full flex-col items-start",
            "public-section-y",
            "md:min-h-[inherit] md:justify-center",
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
