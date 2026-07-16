"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { SERVICES_PREVIEW } from "./services-data";

export type ServiceCardProps = {
  serviceId: string;
  index: number;
  className?: string;
};

/**
 * Premium interactive service preview card with scroll-enter motion.
 * Looks up data by id so Lucide icons stay on the client boundary.
 */
export function ServiceCard({ serviceId, index, className }: ServiceCardProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const service = SERVICES_PREVIEW.find((item) => item.id === serviceId);

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

  if (!service) return null;

  const Icon = service.icon;
  const numberLabel = String(index + 1).padStart(2, "0");

  return (
    <article
      ref={ref}
      className={cn(
        "group relative h-full",
        "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 motion-reduce:opacity-100 motion-reduce:translate-y-0",
        className
      )}
      style={visible ? { transitionDelay: `${index * 90}ms` } : undefined}
    >
      <Link
        href={ROUTES.PUBLIC.SERVICES}
        aria-label={`Learn more about ${service.title}`}
        className={cn(
          "relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl",
          "border border-slate-100 bg-brand-card p-6 sm:p-7",
          "shadow-sm",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-1 hover:shadow-xl hover:ring-1 hover:ring-blue-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-4 right-5 z-0 select-none",
            "font-serif text-5xl font-medium leading-none text-brand-dark/[0.06]",
            "sm:text-6xl"
          )}
          aria-hidden
        >
          {numberLabel}
        </span>

        <div
          className={cn(
            "relative z-10 mb-5 flex size-12 items-center justify-center rounded-xl",
            "bg-gradient-to-br from-blue-50 to-teal-50",
            "transition-all duration-300 ease-out",
            "group-hover:from-blue-100 group-hover:to-teal-100"
          )}
        >
          <Icon
            className={cn(
              "size-5 text-brand-blue",
              "transition-transform duration-300 ease-out",
              "group-hover:scale-110"
            )}
            strokeWidth={1.75}
            aria-hidden
          />
        </div>

        <h3 className="relative z-10 text-lg font-semibold text-brand-dark">
          {service.title}
        </h3>

        <p className="relative z-10 mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
          {service.description}
        </p>

        <span
          className={cn(
            "relative z-10 mt-6 inline-flex items-center gap-1.5",
            "text-sm font-medium text-brand-teal"
          )}
        >
          Learn More
          <ArrowRight
            className={cn(
              "size-4",
              "transition-transform duration-300 ease-out",
              "group-hover:translate-x-1"
            )}
            aria-hidden
          />
        </span>
      </Link>
    </article>
  );
}
