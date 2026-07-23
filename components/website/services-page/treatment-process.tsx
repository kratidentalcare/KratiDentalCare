"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { cn } from "@/lib/utils";

import {
  TREATMENT_PROCESS_SECTION,
  TREATMENT_STEPS,
} from "./treatment-process-data";

export type TreatmentProcessProps = {
  className?: string;
};

/**
 * Vertical (mobile) / horizontal (desktop) treatment journey timeline.
 */
export function TreatmentProcess({ className }: TreatmentProcessProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="treatment-process"
      aria-labelledby="treatment-process-heading"
      className={cn(
        "relative overflow-hidden bg-brand-surface font-montserrat",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-1/3 -right-24 size-72 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_12%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-96"
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <header
          className={cn(
            "mx-auto flex max-w-2xl flex-col items-center text-center",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          )}
        >
          <p
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-brand-blue/15",
              "bg-white px-3.5 py-1.5",
              "text-[0.6875rem] font-bold tracking-[0.16em] text-brand-red uppercase",
              "sm:text-xs sm:tracking-[0.18em]"
            )}
          >
            <span
              className="size-1.5 shrink-0 rounded-full bg-brand-teal"
              aria-hidden
            />
            {TREATMENT_PROCESS_SECTION.badge}
          </p>

          <h2
            id="treatment-process-heading"
            className={cn(
              "mt-5 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
              "sm:mt-6 sm:text-4xl lg:text-5xl"
            )}
          >
            <span className="block">{TREATMENT_PROCESS_SECTION.heading}</span>
            <span className="block text-brand-blue">
              {TREATMENT_PROCESS_SECTION.headingAccent}
            </span>
          </h2>

          <div className="mt-4 h-1 w-12 rounded-full bg-brand-red" aria-hidden />

          <p
            className={cn(
              "mt-5 max-w-xl text-sm leading-relaxed text-brand-muted",
              "sm:mt-6 sm:text-[0.9375rem]"
            )}
          >
            {TREATMENT_PROCESS_SECTION.description}
          </p>
        </header>

        {/* Mobile / tablet: vertical timeline */}
        <ol
          className={cn(
            "relative mx-auto mt-10 max-w-md list-none sm:mt-14 lg:hidden",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out motion-safe:delay-100",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          )}
          aria-label="Treatment process steps"
        >
          <div
            className="pointer-events-none absolute top-6 bottom-6 left-[1.375rem] w-px bg-gradient-to-b from-brand-blue/30 via-brand-teal/40 to-brand-blue/20 sm:left-7"
            aria-hidden
          />

          {TREATMENT_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === TREATMENT_STEPS.length - 1;

            return (
              <li
                key={step.id}
                className={cn(
                  "relative flex gap-4 sm:gap-5",
                  !isLast && "pb-8 sm:pb-10"
                )}
                style={
                  visible
                    ? { transitionDelay: `${120 + index * 80}ms` }
                    : undefined
                }
              >
                <div
                  className={cn(
                    "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-14",
                    "bg-white shadow-[0_8px_24px_color-mix(in_srgb,var(--brand-blue)_14%,transparent)]",
                    "ring-1 ring-brand-blue/10"
                  )}
                >
                  <Icon
                    className="size-4 text-brand-blue sm:size-5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>

                <div className="min-w-0 pt-1.5 sm:pt-2.5">
                  <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-brand-teal uppercase sm:text-xs">
                    Step {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-brand-dark sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-brand-muted sm:text-sm">
                    {step.description}
                  </p>
                </div>

                {!isLast ? (
                  <ArrowDown
                    className="absolute -bottom-1 left-[0.85rem] size-3.5 text-brand-teal/50 sm:left-[1.05rem]"
                    aria-hidden
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        {/* Desktop: horizontal journey */}
        <ol
          className={cn(
            "relative mt-16 hidden list-none lg:grid lg:grid-cols-5 lg:gap-4",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out motion-safe:delay-100",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          )}
          aria-label="Treatment process steps"
        >
          <div
            className="pointer-events-none absolute top-7 right-[10%] left-[10%] h-px bg-gradient-to-r from-brand-blue/20 via-brand-teal/35 to-brand-blue/20"
            aria-hidden
          />

          {TREATMENT_STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.id}
                className="relative flex flex-col items-center text-center"
                style={
                  visible
                    ? { transitionDelay: `${140 + index * 90}ms` }
                    : undefined
                }
              >
                <div
                  className={cn(
                    "relative z-10 flex size-14 items-center justify-center rounded-2xl",
                    "bg-white shadow-[0_10px_28px_color-mix(in_srgb,var(--brand-blue)_14%,transparent)]",
                    "ring-1 ring-brand-blue/10",
                    "transition-transform duration-300 ease-out hover:scale-105"
                  )}
                >
                  <Icon
                    className="size-5 text-brand-blue"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>

                <p className="mt-5 text-[0.6875rem] font-medium tracking-[0.14em] text-brand-teal uppercase">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1.5 text-base font-semibold text-brand-dark">
                  {step.title}
                </h3>
                <p className="mt-1.5 max-w-[12rem] text-sm leading-relaxed text-brand-muted">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </PageContainer>
    </section>
  );
}
