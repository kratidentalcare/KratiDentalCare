"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Stethoscope,
  User,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import {
  DOCTORS_SECTION,
  SPECIALTY_ICONS,
  type Doctor,
} from "./doctors-data";

export type DoctorCardProps = {
  doctor: Doctor;
  index?: number;
  /** Show section badge + heading (typically true for the first card). */
  showIntro?: boolean;
  className?: string;
};

const DOT_GRID = Array.from({ length: 40 }, (_, i) => i);

/**
 * Asymmetric doctor showcase — circular photo left, content right.
 * Mobile order: intro → photo → details. Desktop: photo | intro+details.
 */
export function DoctorCard({
  doctor,
  index = 0,
  showIntro = true,
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
      { threshold: 0.1, rootMargin: "0px 0px -24px 0px" }
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
          "grid grid-cols-1 items-center justify-items-center gap-7",
          "sm:gap-9",
          "lg:grid-cols-[auto_minmax(0,1fr)] lg:justify-items-stretch lg:gap-x-14 lg:gap-y-0 xl:gap-x-16"
        )}
      >
        {/* Intro — first on mobile, top of right column on desktop */}
        {showIntro ? (
          <div
            className={cn(
              "flex w-full flex-col items-center text-center",
              "lg:col-start-2 lg:row-start-1 lg:items-start lg:self-end lg:pb-6 lg:text-left",
              "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
              visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 motion-reduce:opacity-100 motion-reduce:translate-y-0"
            )}
          >
            <p
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-brand-blue/15",
                "bg-white px-3 py-1.5",
                "text-[0.625rem] font-bold tracking-[0.14em] text-brand-blue uppercase",
                "sm:px-3.5 sm:text-[0.6875rem] sm:tracking-[0.16em]",
                "lg:text-xs lg:tracking-[0.18em]"
              )}
            >
              <Stethoscope
                className="size-3.5 shrink-0 text-brand-blue"
                strokeWidth={1.75}
                aria-hidden
              />
              {DOCTORS_SECTION.badge}
            </p>

            <h2
              id="doctors-heading"
              className={cn(
                "mt-4 max-w-[18rem] font-serif text-[1.75rem] font-medium leading-[1.15] tracking-tight text-brand-dark",
                "sm:mt-5 sm:max-w-md sm:text-4xl",
                "lg:max-w-none lg:text-[2.75rem] xl:text-5xl"
              )}
            >
              <span className="block">{DOCTORS_SECTION.heading}</span>
              <span className="block text-brand-blue">
                {DOCTORS_SECTION.headingAccent}
              </span>
            </h2>

            <div
              className="mt-3.5 h-1 w-10 rounded-full bg-brand-blue sm:mt-4 sm:w-12"
              aria-hidden
            />
          </div>
        ) : null}

        {/* Photo — second on mobile, left column on desktop */}
        <div
          className={cn(
            "relative flex flex-col items-center",
            showIntro
              ? "lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center"
              : "lg:col-start-1 lg:row-start-1",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
            visible
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 motion-reduce:opacity-100 motion-reduce:scale-100"
          )}
          style={visible ? { transitionDelay: "60ms" } : undefined}
        >
          {/* Image frame only — ring/dots sized to the circle, not the badge */}
          <div
            className={cn(
              "relative",
              "size-[12.5rem] sm:size-[15.5rem] lg:size-[21.25rem]"
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 -left-1 z-0 hidden -translate-y-1/2",
                "md:grid md:grid-cols-4 md:gap-2.5",
                "lg:-left-6 lg:grid-cols-5 lg:gap-3"
              )}
              aria-hidden
            >
              {DOT_GRID.map((dot) => (
                <span
                  key={dot}
                  className="size-1.5 rounded-full bg-brand-blue/25 lg:size-[7px]"
                />
              ))}
            </div>

            {/* Perfect circle wireframe — only around the portrait */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 z-0 -m-3 rounded-full",
                "border-2 border-brand-blue/15 sm:-m-4 lg:-m-5",
                "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
                visible
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 motion-reduce:opacity-100 motion-reduce:scale-100"
              )}
              style={visible ? { transitionDelay: "100ms" } : undefined}
              aria-hidden
            />

            <div
              className={cn(
                "relative z-10 size-full overflow-hidden rounded-full",
                "border-[6px] border-white bg-slate-100 shadow-xl sm:border-8"
              )}
            >
              <Image
                src={doctor.imageSrc}
                alt={doctor.imageAlt}
                fill
                sizes="(max-width: 640px) 200px, (max-width: 1024px) 248px, 340px"
                className="object-cover object-[center_15%]"
                priority={index === 0}
              />
            </div>

            {/* Experience — overlaps bottom of photo; outside ring sizing box visually */}
            <div
              role="status"
              aria-label={`${doctor.experienceYears} ${doctor.experienceLabel}`}
              className={cn(
                "absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 translate-y-1/2",
                "items-center gap-2.5 rounded-2xl bg-brand-card px-3.5 py-2.5 shadow-lg",
                "ring-1 ring-brand-blue/10",
                "lg:left-auto lg:right-0 lg:translate-x-4 lg:translate-y-0 lg:gap-3 lg:p-3.5",
                "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
                visible
                  ? "opacity-100"
                  : "opacity-0 motion-reduce:opacity-100"
              )}
              style={visible ? { transitionDelay: "140ms" } : undefined}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  "bg-brand-blue/10 lg:size-10"
                )}
              >
                <User
                  className="size-4 text-brand-blue"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>
              <span className="pr-0.5 text-left leading-tight whitespace-nowrap">
                <span className="block text-sm font-bold text-brand-dark lg:text-base">
                  {doctor.experienceYears}
                </span>
                <span className="block text-[0.6875rem] text-brand-muted lg:text-[0.8125rem]">
                  {doctor.experienceLabel}
                </span>
              </span>
            </div>
          </div>

          {/* Spacer so content below clears the overlapping badge */}
          <div className="h-8 w-full sm:h-9 lg:h-0" aria-hidden />
        </div>

        {/* Details — third on mobile, bottom of right column on desktop */}
        <div
          className={cn(
            "flex w-full min-w-0 flex-col items-center text-center",
            showIntro
              ? "lg:col-start-2 lg:row-start-2 lg:items-start lg:self-start lg:text-left"
              : "lg:col-start-2 lg:row-start-1 lg:items-start lg:text-left",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          )}
          style={visible ? { transitionDelay: "120ms" } : undefined}
        >
          <div>
            <p
              className={cn(
                "text-[0.625rem] font-bold tracking-[0.14em] text-brand-blue uppercase",
                "sm:text-[0.6875rem] sm:tracking-[0.16em]",
                "lg:text-xs lg:tracking-[0.18em]"
              )}
            >
              {doctor.designation}
            </p>

            <h3
              className={cn(
                "mt-1.5 font-serif text-[1.625rem] font-medium tracking-tight text-brand-dark",
                "sm:mt-2 sm:text-3xl",
                "lg:text-4xl"
              )}
            >
              {doctor.name}
            </h3>

            <div
              className="mx-auto mt-2 h-0.5 w-8 rounded-full bg-brand-blue/35 lg:mx-0"
              aria-hidden
            />
          </div>

          <ul
            className={cn(
              "mt-5 flex max-w-sm flex-wrap items-center justify-center gap-2",
              "sm:mt-6 sm:max-w-md sm:gap-2.5",
              "lg:max-w-none lg:justify-start"
            )}
            aria-label={`${doctor.name} specializations`}
          >
            {doctor.specializations.map((spec, i) => {
              const Icon = SPECIALTY_ICONS[spec.icon];
              const chipTone =
                i % 2 === 1
                  ? "bg-brand-teal/12 text-brand-teal"
                  : "bg-brand-blue/12 text-brand-blue";

              return (
                <li
                  key={spec.id}
                  className={cn(
                    "motion-safe:transition-[opacity,transform] motion-safe:duration-300 motion-safe:ease-out",
                    visible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 motion-reduce:opacity-100 motion-reduce:translate-y-0"
                  )}
                  style={
                    visible
                      ? { transitionDelay: `${200 + i * 70}ms` }
                      : undefined
                  }
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border border-brand-blue/10",
                      "bg-white px-2.5 py-1.5 text-[0.6875rem] font-medium text-brand-dark",
                      "shadow-sm sm:gap-2 sm:px-3 sm:text-xs"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full sm:size-6",
                        chipTone
                      )}
                    >
                      <Icon
                        className="size-3 sm:size-3.5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                    {spec.label}
                  </span>
                </li>
              );
            })}
          </ul>

          <div
            className={cn(
              "mt-7 flex w-full max-w-sm flex-col gap-2.5",
              "sm:mt-8 sm:max-w-md sm:gap-3",
              "lg:max-w-none lg:flex-row lg:justify-start lg:gap-3.5"
            )}
          >
            <Link
              href={ROUTES.PUBLIC.BOOK}
              className={cn(
                "group/btn inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5",
                "bg-brand-blue text-sm font-semibold text-white",
                "shadow-[0_8px_22px_color-mix(in_srgb,var(--brand-blue)_28%,transparent)]",
                "transition-all duration-300 ease-out",
                "hover:bg-[#0870A8] hover:shadow-[0_12px_28px_color-mix(in_srgb,var(--brand-blue)_34%,transparent)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
                "active:scale-[0.98]",
                "sm:h-12 sm:gap-2.5 sm:px-6",
                "lg:w-auto"
              )}
              aria-label={`Book an appointment with ${doctor.name}`}
            >
              <Calendar className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Book Appointment
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover/btn:translate-x-1"
                aria-hidden
              />
            </Link>

            <Link
              href={ROUTES.PUBLIC.DOCTORS}
              className={cn(
                "group/profile inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5",
                "border border-brand-blue/30 bg-white text-sm font-semibold text-brand-blue",
                "transition-all duration-300 ease-out",
                "hover:border-brand-blue/50 hover:bg-brand-blue/[0.04] hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
                "active:scale-[0.98]",
                "sm:h-12 sm:gap-2.5 sm:px-6",
                "lg:w-auto"
              )}
              aria-label={`View profile of ${doctor.name}`}
            >
              View Profile
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full sm:size-7",
                  "bg-brand-blue/10",
                  "transition-transform duration-300 ease-out",
                  "group-hover/profile:scale-110"
                )}
              >
                <User
                  className="size-3.5 text-brand-blue"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
