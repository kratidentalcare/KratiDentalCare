import Image from "next/image";

import { cn } from "@/lib/utils";

import { FloatingCard } from "./floating-card";

const HERO_IMAGE = {
  src: "/images/hero/arch-patient.jpg",
  alt: "Smiling patient receiving care at a modern dental clinic in Jaipur",
} as const;

/** Scattered teal dots — bottom-right of arch */
const DOT_CLUSTERS = [
  { top: "62%", left: "72%", size: "h-14 w-16", opacity: "opacity-70" },
  { top: "72%", left: "80%", size: "h-16 w-20", opacity: "opacity-55" },
  { top: "78%", left: "66%", size: "h-12 w-14", opacity: "opacity-45" },
  { top: "68%", left: "88%", size: "h-10 w-12", opacity: "opacity-40" },
] as const;

export type HeroImageProps = {
  className?: string;
};

/**
 * Arch-shaped hero visual with brand gradient blob, teal dots, floating card.
 */
export function HeroImage({ className }: HeroImageProps) {
  return (
    <div
      className={cn(
        "hero-animate-fade-in hero-delay-3 relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none",
        className
      )}
    >
      {/* Brand gradient depth blob */}
      <div
        aria-hidden
        className="absolute top-[10%] left-1/2 h-[75%] w-[90%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_18%,transparent),color-mix(in_srgb,var(--brand-teal)_12%,transparent)_45%,transparent_72%)] blur-2xl"
      />

      {/* Teal scattered dots — bleed past arch edge */}
      {DOT_CLUSTERS.map((cluster, index) => (
        <div
          key={index}
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-0",
            cluster.size,
            cluster.opacity
          )}
          style={{ top: cluster.top, left: cluster.left }}
        >
          <div className="h-full w-full bg-[radial-gradient(circle,var(--brand-teal)_2px,transparent_2.1px)] bg-[length:10px_10px]" />
        </div>
      ))}

      <div
        className={cn(
          "hero-arch relative z-10 mx-auto w-full overflow-hidden bg-brand-card",
          "aspect-[4/5] sm:aspect-[3/4]",
          "max-w-[20rem] sm:max-w-[26rem]",
          "lg:mx-0 lg:aspect-auto lg:h-[min(36rem,calc(100vh-9rem))] lg:max-h-[38rem] lg:max-w-none",
          "shadow-[0_24px_56px_color-mix(in_srgb,var(--brand-blue)_16%,transparent)]"
        )}
      >
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 50vw"
          className="object-cover object-[48%_18%]"
        />
      </div>

      {/* Overlap arch on desktop; static below on mobile */}
      <FloatingCard className="relative z-20 mt-4 w-fit sm:mt-5 lg:absolute lg:bottom-6 lg:left-4 lg:mt-0 xl:left-6" />
    </div>
  );
}
