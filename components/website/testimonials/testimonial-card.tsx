"use client";

import { cn } from "@/lib/utils";

import { BeforeAfterSlider } from "./before-after-slider";
import type { Testimonial } from "./testimonial-data";

export type TestimonialCardProps = {
  testimonial: Testimonial;
  /** Triggers fade when the active patient changes. */
  animating?: boolean;
  className?: string;
};

/**
 * Active transformation: before/after comparison slider.
 */
export function TestimonialCard({
  testimonial,
  animating = false,
  className,
}: TestimonialCardProps) {
  return (
    <article
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col",
        "motion-safe:transition-[opacity,transform] motion-safe:duration-300 motion-safe:ease-out",
        animating
          ? "opacity-0 translate-y-3 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          : "opacity-100 translate-y-0",
        className
      )}
      aria-label={`Smile transformation for ${testimonial.patientName}`}
    >
      <BeforeAfterSlider
        key={testimonial.id}
        beforeImage={testimonial.beforeImage}
        afterImage={testimonial.afterImage}
        patientName={testimonial.patientName}
      />
    </article>
  );
}
