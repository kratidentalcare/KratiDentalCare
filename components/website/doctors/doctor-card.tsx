"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Calendar } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import {
  SPECIALTY_ICONS,
  type Doctor,
} from "./doctors-data";

export type DoctorCardProps = {
  doctor: Doctor;
  index?: number;
  className?: string;
};

/**
 * Editorial doctor showcase — portrait frame + clean content column.
 * Matches Why Choose Us / contact-page visual language.
 */
export function DoctorCard({
  doctor,
  index = 0,
  className,
}: DoctorCardProps) {
  const ref = useRef<HTMLElement>(null);
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
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      id={`doctor-${doctor.slug}`}
      className={cn("relative w-full", className)}
    >
      <div
        className={cn(
          "grid grid-cols-1 items-center gap-10",
          "md:gap-12",
          "lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-14 xl:gap-16",
        )}
      >
        {/* Portrait */}
        <div
          className={cn(
            "relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5 motion-reduce:opacity-100 motion-reduce:translate-y-0",
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute -top-6 -left-6 -z-10 size-48 rounded-full",
              "bg-gradient-to-br from-brand-blue/[0.14] to-brand-teal/[0.1] blur-3xl",
              "sm:size-64 sm:-top-8 sm:-left-8",
            )}
            aria-hidden
          />
          <div
            className={cn(
              "pointer-events-none absolute -right-4 -bottom-4 -z-10 size-40 rounded-full",
              "bg-gradient-to-tl from-brand-red/[0.08] to-brand-blue/[0.1] blur-3xl",
              "sm:size-52",
            )}
            aria-hidden
          />

          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border border-brand-blue/10 bg-white",
              "aspect-[4/5] shadow-[0_16px_48px_color-mix(in_srgb,var(--brand-blue)_10%,transparent)]",
            )}
          >
            <Image
              src={doctor.imageSrc}
              alt={doctor.imageAlt}
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover object-[center_12%]"
              priority={index === 0}
            />
            <div
              className={cn(
                "pointer-events-none absolute inset-0",
                "bg-gradient-to-t from-brand-dark/25 via-transparent to-transparent",
              )}
              aria-hidden
            />
          </div>

          <div
            role="status"
            aria-label={`${doctor.experienceYears} ${doctor.experienceLabel}`}
            className={cn(
              "absolute -bottom-4 left-4 z-10 sm:left-5",
              "rounded-2xl border border-white/70 bg-white/95 px-4 py-3",
              "shadow-[0_12px_36px_color-mix(in_srgb,var(--brand-blue)_14%,transparent)]",
              "backdrop-blur-md supports-backdrop-filter:bg-white/85",
              "-rotate-1",
              "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
              visible
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 motion-reduce:opacity-100 motion-reduce:scale-100",
            )}
            style={visible ? { transitionDelay: "180ms" } : undefined}
          >
            <p className="font-serif text-2xl font-medium leading-none tracking-tight text-brand-blue sm:text-3xl">
              {doctor.experienceYears}
            </p>
            <p className="mt-1.5 text-[0.6875rem] leading-snug text-brand-muted sm:text-xs">
              {doctor.experienceLabel}
            </p>
          </div>
        </div>

        {/* Content */}
        <div
          className={cn(
            "flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left",
            "pt-4 lg:pt-0",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5 motion-reduce:opacity-100 motion-reduce:translate-y-0",
          )}
          style={visible ? { transitionDelay: "100ms" } : undefined}
        >
          <p
            className={cn(
              "text-[0.6875rem] font-medium tracking-[0.16em] text-brand-red uppercase",
              "sm:text-xs sm:tracking-[0.18em]",
            )}
          >
            {doctor.designation}
          </p>

          <h3
            className={cn(
              "mt-3 font-serif text-[1.75rem] font-medium tracking-tight text-brand-dark",
              "sm:mt-4 sm:text-4xl lg:text-[2.75rem]",
            )}
          >
            {doctor.name}
          </h3>

          <div
            className="mx-auto mt-3 h-1 w-10 rounded-full bg-brand-red lg:mx-0"
            aria-hidden
          />

          <p
            className={cn(
              "mt-5 max-w-md text-sm leading-relaxed text-brand-muted",
              "sm:mt-6 sm:text-[0.9375rem]",
            )}
          >
            {doctor.blurb}
          </p>

          <ul
            className="mt-7 flex w-full max-w-md flex-col gap-1 sm:mt-8 lg:max-w-none"
            aria-label={`${doctor.name} specializations`}
          >
            {doctor.specializations.map((spec, i) => {
              const Icon = SPECIALTY_ICONS[spec.icon];
              return (
                <li
                  key={spec.id}
                  className={cn(
                    "group -mx-2.5 list-none rounded-xl px-2.5 py-2",
                    "motion-safe:transition-[opacity,transform,background-color] motion-safe:duration-300 motion-safe:ease-out",
                    "hover:bg-brand-blue/[0.06]",
                    visible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3 motion-reduce:opacity-100 motion-reduce:translate-y-0",
                  )}
                  style={
                    visible
                      ? { transitionDelay: `${200 + i * 80}ms` }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                        "bg-brand-blue/[0.08] ring-1 ring-brand-blue/10",
                        "transition-colors duration-300 group-hover:bg-brand-blue/[0.12] group-hover:ring-brand-red/25",
                      )}
                      aria-hidden
                    >
                      <Icon
                        className="size-[1.125rem] text-brand-blue transition-colors duration-300 group-hover:text-brand-red"
                        strokeWidth={1.75}
                      />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-brand-dark">
                      {spec.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div
            className={cn(
              "mt-8 flex w-full max-w-md flex-col gap-3",
              "sm:mt-9 sm:flex-row sm:justify-center lg:max-w-none lg:justify-start",
            )}
          >
            <Link
              href={ROUTES.PUBLIC.BOOK}
              className={cn(
                "group/btn inline-flex h-12 items-center justify-center gap-2 rounded-full px-7",
                "bg-brand-blue text-sm font-semibold text-white sm:text-base",
                "shadow-[0_10px_28px_color-mix(in_srgb,var(--brand-blue)_28%,transparent)]",
                "transition-colors duration-200",
                "hover:bg-brand-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
                "active:scale-[0.98]",
              )}
              aria-label={`Book an appointment with ${doctor.name}`}
            >
              <Calendar className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Book and Smile
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover/btn:translate-x-1"
                aria-hidden
              />
            </Link>

            <Link
              href={ROUTES.PUBLIC.DOCTORS}
              className={cn(
                "group/profile inline-flex h-12 items-center justify-center gap-2 rounded-full px-7",
                "border border-brand-navy/20 bg-white/80 text-sm font-semibold text-brand-dark sm:text-base",
                "transition-colors duration-200",
                "hover:border-brand-blue/40 hover:bg-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
                "active:scale-[0.98]",
              )}
              aria-label={`View profile of ${doctor.name}`}
            >
              View profile
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover/profile:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
