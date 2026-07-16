import { PageContainer } from "@/components/layout";
import { cn } from "@/lib/utils";

import { HeroContent } from "./hero-content";
import { HeroImage } from "./hero-image";

import "./hero.css";

export type HeroProps = {
  className?: string;
};

/**
 * Editorial boutique hero — serif copy left, arch imagery right.
 * Mobile-first: text first, arch below; desktop 50 / 50 split.
 */
export function Hero({ className }: HeroProps) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden bg-[#0A84C6]/10 font-montserrat",
        className
      )}
    >
      <PageContainer size="xl" className="relative public-section-y">
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14">
          <HeroContent className="order-1" />
          <HeroImage className="order-2 w-full lg:-mt-4 xl:-mt-6" />
        </div>
      </PageContainer>
    </section>
  );
}
