"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const WHY_CHOOSE_US_IMAGE = {
  src: "/whychooseus.png",
  alt: "Krati Dental Care reception and treatment area",
} as const;

export type WhyChooseUsImageProps = {
  className?: string;
};

/**
 * Image column with decorative blob and floating years-of-care stat card.
 */
export function WhyChooseUsImage({ className }: WhyChooseUsImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none",
        className
      )}
    >
      {/* Soft gradient blob behind the frame */}
      <div
        className={cn(
          "pointer-events-none absolute -top-6 -left-6 -z-10 size-48 rounded-full",
          "bg-gradient-to-br from-brand-blue/[0.12] to-brand-teal/[0.12] blur-3xl",
          "sm:size-64 sm:-top-8 sm:-left-8"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-4 -bottom-4 -z-10 size-40 rounded-full",
          "bg-gradient-to-tl from-brand-teal/[0.12] to-brand-blue/[0.12] blur-3xl",
          "sm:size-52"
        )}
        aria-hidden
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-brand-blue/10 shadow-xl",
          "aspect-[4/3]",
          "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5 motion-reduce:opacity-100 motion-reduce:translate-y-0"
        )}
      >
        <Image
          src={WHY_CHOOSE_US_IMAGE.src}
          alt={WHY_CHOOSE_US_IMAGE.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover object-center"
        />
      </div>

      <div
        role="status"
        aria-label="15+ years of trusted care"
        className={cn(
          "absolute -bottom-4 -left-2 z-10 sm:-left-4",
          "rounded-xl border border-white/60 bg-white/90 px-4 py-3",
          "shadow-[0_12px_36px_color-mix(in_srgb,var(--brand-blue)_14%,transparent)]",
          "backdrop-blur-md supports-backdrop-filter:bg-white/80",
          "-rotate-2",
          "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
          visible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 motion-reduce:opacity-100 motion-reduce:scale-100"
        )}
        style={visible ? { transitionDelay: "220ms" } : undefined}
      >
        <p className="font-serif text-2xl font-medium leading-none tracking-tight text-brand-blue sm:text-3xl">
          15+
        </p>
        <p className="mt-1.5 text-[0.6875rem] leading-snug text-brand-muted sm:text-xs">
          Years of Trusted Care
        </p>
      </div>
    </div>
  );
}
