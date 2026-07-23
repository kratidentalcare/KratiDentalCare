"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { FeatureItem } from "./feature-item";
import { WHY_CHOOSE_US_FEATURES } from "./features-data";

export type WhyChooseUsContentProps = {
  className?: string;
};

/**
 * Right-column copy: eyebrow, serif headline, description, feature list.
 */
export function WhyChooseUsContent({ className }: WhyChooseUsContentProps) {
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
      { threshold: 0.18, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-start text-left",
        className
      )}
    >
      <div
        className={cn(
          "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 motion-reduce:opacity-100 motion-reduce:translate-y-0"
        )}
      >
        <p
          className={cn(
            "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-blue uppercase",
            "sm:text-xs sm:tracking-[0.2em]"
          )}
        >
          Why Krati
        </p>

        <h2
          id="why-choose-us-heading"
          className={cn(
            "mt-4 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
            "sm:mt-5 sm:text-4xl lg:text-[2.75rem]"
          )}
        >
          Care designed around{" "}
          <span className="relative inline-block text-brand-blue">
            you
            <span
              className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-brand-blue/30"
              aria-hidden
            />
          </span>
        </h2>

        <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-muted sm:mt-6 sm:text-[0.9375rem]">
          Comfort, precision, and results you can trust — every visit.
        </p>
      </div>

      <ul className="mt-8 flex w-full flex-col gap-4 sm:mt-10">
        {WHY_CHOOSE_US_FEATURES.map((feature, index) => (
          <FeatureItem
            key={feature.id}
            feature={feature}
            index={index}
            visible={visible}
          />
        ))}
      </ul>
    </div>
  );
}
