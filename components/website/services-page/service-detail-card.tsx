"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { SERVICES_CATALOG } from "./services-catalog-data";

export type ServiceDetailCardProps = {
  serviceId: string;
  index: number;
  className?: string;
};

/**
 * Full-catalog service card — icon, copy, benefits, and book CTA.
 * Looks up data by id so Lucide icons stay on the client boundary.
 */
export function ServiceDetailCard({
  serviceId,
  index,
  className,
}: ServiceDetailCardProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const service = SERVICES_CATALOG.find((item) => item.id === serviceId);

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
      { threshold: 0.14, rootMargin: "0px 0px -28px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!service) return null;

  const Icon = service.icon;
  const numberLabel = String(index + 1).padStart(2, "0");

  return (
    <article
      ref={ref}
      id={service.id}
      className={cn(
        "group relative h-full scroll-mt-28",
        "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 motion-reduce:opacity-100 motion-reduce:translate-y-0",
        className
      )}
      style={visible ? { transitionDelay: `${(index % 3) * 90}ms` } : undefined}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl",
          "border border-slate-100 bg-white p-5 sm:p-7",
          "shadow-[0_12px_32px_color-mix(in_srgb,black_10%,transparent)]",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-1 hover:shadow-[0_18px_40px_color-mix(in_srgb,black_16%,transparent)]",
          "hover:ring-1 hover:ring-brand-blue/15"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-3.5 right-4 z-0 select-none",
            "font-serif text-4xl font-medium leading-none text-brand-dark/[0.06]",
            "sm:top-4 sm:right-5 sm:text-6xl"
          )}
          aria-hidden
        >
          {numberLabel}
        </span>

        <div
          className={cn(
            "relative z-10 mb-4 flex size-10 items-center justify-center rounded-xl",
            "bg-gradient-to-br from-blue-50 to-teal-50 sm:mb-5 sm:size-12",
            "transition-all duration-300 ease-out",
            "group-hover:from-blue-100 group-hover:to-teal-100"
          )}
        >
          <Icon
            className={cn(
              "size-4 text-brand-blue sm:size-5",
              "transition-transform duration-300 ease-out",
              "group-hover:scale-110"
            )}
            strokeWidth={1.75}
            aria-hidden
          />
        </div>

        <h3 className="relative z-10 text-base font-semibold text-brand-dark sm:text-lg">
          {service.title}
        </h3>

        <p className="relative z-10 mt-1.5 text-[0.8125rem] leading-relaxed text-brand-muted sm:mt-2 sm:text-[0.9375rem]">
          {service.description}
        </p>

        <ul className="relative z-10 mt-4 flex flex-col gap-2 sm:mt-5" role="list">
          {service.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2 text-[0.8125rem] leading-snug text-brand-dark/85 sm:text-sm"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                  "bg-brand-teal/12 text-brand-teal"
                )}
                aria-hidden
              >
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="relative z-10 mt-auto pt-5 sm:pt-6">
          <Link
            href={ROUTES.PUBLIC.BOOK}
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue",
              "transition-colors hover:text-[#0870A8]",
              "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
            )}
            aria-label={`Book appointment for ${service.title}`}
          >
            Book Appointment
            <ArrowRight
              className={cn(
                "size-4",
                "transition-transform duration-300 ease-out",
                "group-hover:translate-x-1"
              )}
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
