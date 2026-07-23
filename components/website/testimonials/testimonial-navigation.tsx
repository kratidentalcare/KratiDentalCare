"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type TestimonialNavigationProps = {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  className?: string;
};

/**
 * Previous / next controls with pagination dots for smile transformations.
 */
export function TestimonialNavigation({
  currentIndex,
  total,
  onPrevious,
  onNext,
  onSelect,
  className,
}: TestimonialNavigationProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 sm:gap-6",
        className
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Previous smile transformation"
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full",
            "border border-brand-blue/20 bg-white text-brand-blue",
            "shadow-sm transition-all duration-300 ease-out",
            "hover:border-brand-blue/40 hover:bg-brand-blue/[0.04] hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
            "active:scale-[0.96]",
            "sm:size-12"
          )}
        >
          <ChevronLeft className="size-5" strokeWidth={1.75} aria-hidden />
        </button>

        <p
          className="min-w-[4.5rem] text-center text-sm font-medium tabular-nums text-brand-muted"
          aria-live="polite"
        >
          <span className="text-brand-dark">{currentIndex + 1}</span>
          <span className="mx-1 text-brand-muted/60">/</span>
          <span>{total}</span>
        </p>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next smile transformation"
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full",
            "border border-brand-blue/20 bg-white text-brand-blue",
            "shadow-sm transition-all duration-300 ease-out",
            "hover:border-brand-blue/40 hover:bg-brand-blue/[0.04] hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
            "active:scale-[0.96]",
            "sm:size-12"
          )}
        >
          <ChevronRight className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div
        className="flex items-center gap-2"
        role="tablist"
        aria-label="Smile transformation pages"
      >
        {Array.from({ length: total }, (_, index) => {
          const active = index === currentIndex;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Show transformation ${index + 1} of ${total}`}
              onClick={() => onSelect(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
                active
                  ? "w-7 bg-brand-red"
                  : "w-2 bg-brand-blue/25 hover:bg-brand-blue/45"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
