"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { PageContainer } from "@/components/layout";
import { cn } from "@/lib/utils";

import { TestimonialCard } from "./testimonial-card";
import { TESTIMONIALS, TESTIMONIALS_SECTION } from "./testimonial-data";
import { TestimonialNavigation } from "./testimonial-navigation";

export type TestimonialsProps = {
  className?: string;
};

const SWIPE_THRESHOLD_PX = 56;

function TestimonialsWave({
  edge,
  fill,
}: {
  edge: "top" | "bottom";
  fill: string;
}) {
  const isTop = edge === "top";

  return (
    <div
      className={cn(
        "pointer-events-none relative z-10 w-full leading-[0]",
        isTop ? "-mb-px" : "-mt-px"
      )}
      aria-hidden
    >
      <svg
        className="block h-16 w-full sm:h-24 lg:h-28"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isTop ? (
          <path
            fill={fill}
            d="M0,0 L1440,0 L1440,36 C1200,108 960,12 720,60 C480,108 240,18 0,72 Z"
          />
        ) : (
          <path
            fill={fill}
            d="M0,72 C240,18 480,108 720,60 C960,12 1200,108 1440,36 L1440,120 L0,120 Z"
          />
        )}
      </svg>
    </div>
  );
}

/**
 * Homepage “Smile Transformations” — interactive before/after showcase.
 * Supports unlimited testimonials via TESTIMONIALS data; no auto-slide.
 */
export function Testimonials({ className }: TestimonialsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const swipeStartX = useRef<number | null>(null);
  const swipeOnSlider = useRef(false);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  const total = TESTIMONIALS.length;
  const active = TESTIMONIALS[index] ?? TESTIMONIALS[0];

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

  const goTo = useCallback(
    (nextIndex: number) => {
      const normalized = ((nextIndex % total) + total) % total;
      if (normalized === index) return;

      setAnimating(true);
      window.setTimeout(() => {
        setIndex(normalized);
        requestAnimationFrame(() => setAnimating(false));
      }, 200);
    },
    [index, total]
  );

  const goPrevious = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  const onSectionKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[role="slider"]')) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  const onSwipePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    swipeOnSlider.current = Boolean(target?.closest('[role="slider"]'));
    if (swipeOnSlider.current) {
      swipeStartX.current = null;
      return;
    }
    swipeStartX.current = event.clientX;
  };

  const onSwipePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeOnSlider.current || swipeStartX.current === null) {
      swipeStartX.current = null;
      return;
    }

    const delta = event.clientX - swipeStartX.current;
    swipeStartX.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) goNext();
    else goPrevious();
  };

  if (!active) return null;

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-labelledby="testimonials-heading"
      tabIndex={0}
      onKeyDown={onSectionKeyDown}
      className={cn(
        "relative overflow-hidden font-montserrat outline-none",
        "bg-brand-surface",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-20 top-24 size-72 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_10%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-96",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -left-16 bottom-20 size-64 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-red)_6%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-80",
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative z-10 public-section-y">
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
              "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-red uppercase",
              "sm:text-xs sm:tracking-[0.2em]"
            )}
          >
            {TESTIMONIALS_SECTION.badge}
          </p>

          <h2
            id="testimonials-heading"
            className={cn(
              "mt-5 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
              "sm:mt-6 sm:text-4xl lg:text-5xl"
            )}
          >
            <span className="block">{TESTIMONIALS_SECTION.heading}</span>
            <span className="block text-brand-blue">
              {TESTIMONIALS_SECTION.headingAccent}
            </span>
          </h2>

          <div className="mt-5 h-1 w-12 rounded-full bg-brand-red" aria-hidden />

          <p
            className={cn(
              "mt-5 max-w-xl text-sm leading-relaxed text-brand-muted",
              "sm:mt-6 sm:text-[0.9375rem]",
            )}
          >
            {TESTIMONIALS_SECTION.description}
          </p>
        </header>

        <div
          className={cn(
            "mt-10 sm:mt-14",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out motion-safe:delay-100",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          )}
          onPointerDown={onSwipePointerDown}
          onPointerUp={onSwipePointerUp}
          onPointerCancel={() => {
            swipeStartX.current = null;
          }}
        >
          <TestimonialCard testimonial={active} animating={animating} />

          <TestimonialNavigation
            className="mt-10 sm:mt-12"
            currentIndex={index}
            total={total}
            onPrevious={goPrevious}
            onNext={goNext}
            onSelect={goTo}
          />
        </div>
      </PageContainer>

      <TestimonialsWave edge="bottom" fill="#ffffff" />
    </section>
  );
}
