"use client";

import { Quote, Star } from "lucide-react";

import { cn } from "@/lib/utils";

import { BeforeAfterSlider } from "./before-after-slider";
import type { Testimonial } from "./testimonial-data";

export type TestimonialCardProps = {
  testimonial: Testimonial;
  /** Triggers fade when the active patient changes. */
  animating?: boolean;
  className?: string;
};

function RatingStars({ rating, patientName }: { rating: number; patientName: string }) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${clamped} out of 5 stars for ${patientName}`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4 sm:size-[1.125rem]",
            i < clamped ? "fill-amber-400 text-amber-400" : "text-brand-blue/20",
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </div>
  );
}

/**
 * Active transformation: before/after slider + patient quote.
 */
export function TestimonialCard({
  testimonial,
  animating = false,
  className,
}: TestimonialCardProps) {
  return (
    <article
      className={cn(
        "mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-8",
        "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-14",
        "motion-safe:transition-[opacity,transform] motion-safe:duration-300 motion-safe:ease-out",
        animating
          ? "opacity-0 translate-y-3 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          : "opacity-100 translate-y-0",
        className,
      )}
      aria-label={`Smile transformation for ${testimonial.patientName}`}
    >
      <BeforeAfterSlider
        key={testimonial.id}
        beforeImage={testimonial.beforeImage}
        afterImage={testimonial.afterImage}
        patientName={testimonial.patientName}
      />

      <div
        className={cn(
          "relative flex flex-col items-center text-center",
          "lg:items-start lg:text-left",
        )}
      >
        <Quote
          className="mb-4 size-8 text-brand-blue/25 sm:size-9"
          strokeWidth={1.5}
          aria-hidden
        />

        <RatingStars
          rating={testimonial.rating}
          patientName={testimonial.patientName}
        />

        <blockquote className="mt-4 max-w-md lg:max-w-none">
          <p
            className={cn(
              "font-serif text-xl font-medium leading-snug tracking-tight text-brand-dark",
              "sm:text-2xl lg:text-[1.65rem] lg:leading-[1.35]",
            )}
          >
            &ldquo;{testimonial.review}&rdquo;
          </p>
        </blockquote>

        <div className="mt-6 h-px w-12 bg-brand-red/70 lg:mx-0" aria-hidden />

        <footer className="mt-5">
          <p className="text-sm font-semibold text-brand-dark sm:text-base">
            {testimonial.patientName}
          </p>
          <p className="mt-1 text-xs tracking-wide text-brand-muted sm:text-sm">
            {testimonial.treatment}
          </p>
        </footer>
      </div>
    </article>
  );
}
