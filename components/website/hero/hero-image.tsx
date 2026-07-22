import Image from "next/image";

import { cn } from "@/lib/utils";

import { HeroMobileCta } from "./hero-mobile-cta";

const HERO_BANNER_DESKTOP = {
  src: "/images/hero/hero-banner-2.png",
  alt: "Krati Dental Care clinic reception",
} as const;

const HERO_BANNER_MOBILE = {
  src: "/images/hero/hero-banner-mobile-2.png",
  alt: "Krati Dental Care clinic",
} as const;

export type HeroImageProps = {
  className?: string;
  /** Mobile stacks in document flow; desktop is a full-bleed absolute layer. */
  variant?: "mobile" | "desktop";
  /** Clinic Google Maps / reviews URL from ClinicSettings. */
  mapsUrl?: string | null;
};

/**
 * Hero banner artwork — stacked on mobile, full-bleed background on desktop.
 */
export function HeroImage({
  className,
  variant = "desktop",
  mapsUrl = null,
}: HeroImageProps) {
  if (variant === "mobile") {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden",
          // Fill the first screen below the sticky navbar
          "h-[calc(100svh-5.25rem)] min-h-[28rem]",
          className
        )}
      >
        <Image
          src={HERO_BANNER_MOBILE.src}
          alt={HERO_BANNER_MOBILE.alt}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 1px"
          className="object-cover object-center"
        />
        <HeroMobileCta mapsUrl={mapsUrl} />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 select-none",
        className
      )}
    >
      <Image
        src={HERO_BANNER_DESKTOP.src}
        alt=""
        fill
        priority
        sizes="(max-width: 767px) 1px, 100vw"
        className="object-cover object-center"
      />
    </div>
  );
}
