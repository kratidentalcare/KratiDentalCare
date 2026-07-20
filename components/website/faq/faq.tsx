"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { Accordion } from "@/components/ui/accordion";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { FAQ_SECTION, type FaqItem as FaqItemData } from "./faq-data";
import { FaqItem } from "./faq-item";
import { FaqSectionHeader } from "./section-header";

export type FaqProps = {
  /** Active FAQs from the CMS. Empty / omitted → section not rendered. */
  items?: readonly FaqItemData[];
  className?: string;
};

/**
 * Homepage FAQ — two-column accordion on tablet+, single column on mobile.
 * Only one item open at a time (shadcn/Base UI Accordion default).
 * Returns null when there are no Active FAQs to show.
 */
export function Faq({ items = [], className }: FaqProps) {
  if (items.length === 0) {
    return null;
  }

  return <FaqSection items={items} className={className} />;
}

type FaqSectionProps = {
  items: readonly FaqItemData[];
  className?: string;
};

function FaqSection({ items, className }: FaqSectionProps) {
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
      id="faq"
      aria-labelledby="faq-heading"
      className={cn(
        "relative overflow-hidden bg-brand-surface font-montserrat",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-1/4 -right-24 size-72 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_12%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-96"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-teal)_10%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-80"
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <div
          className={cn(
            "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          )}
        >
          <FaqSectionHeader />
        </div>

        <div
          className={cn(
            "mx-auto mt-10 max-w-5xl sm:mt-14",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out motion-safe:delay-100",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          )}
        >
          <Accordion
            multiple={false}
            className={cn(
              "grid w-full grid-cols-1 gap-x-10 md:grid-cols-2 md:gap-x-14 lg:gap-x-16"
            )}
          >
            {items.map((item) => (
              <FaqItem key={item.id} item={item} />
            ))}
          </Accordion>
        </div>

        <div
          className={cn(
            "mx-auto mt-14 flex max-w-lg flex-col items-center text-center sm:mt-16",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out motion-safe:delay-150",
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          )}
        >
          <p className="font-serif text-xl font-medium tracking-tight text-brand-dark sm:text-2xl">
            {FAQ_SECTION.ctaTitle}
          </p>
          <p className="mt-2 text-sm text-brand-muted sm:text-[0.9375rem]">
            {FAQ_SECTION.ctaDescription}
          </p>

          <Link
            href={ROUTES.PUBLIC.CONTACT}
            className={cn(
              "group mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full px-7",
              "sm:mt-7 sm:h-12 sm:px-8",
              "bg-brand-blue text-sm font-semibold text-white sm:text-base",
              "shadow-[0_10px_28px_color-mix(in_srgb,var(--brand-blue)_28%,transparent)]",
              "transition-all duration-300 ease-out",
              "hover:bg-[#0870A8] hover:shadow-[0_14px_32px_color-mix(in_srgb,var(--brand-blue)_34%,transparent)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
              "active:scale-[0.98]"
            )}
            aria-label="Contact us with more questions"
          >
            <MessageCircle
              className="size-4 shrink-0"
              strokeWidth={1.75}
              aria-hidden
            />
            {FAQ_SECTION.ctaLabel}
            <ArrowRight
              className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
