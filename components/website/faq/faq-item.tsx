"use client";

import { ChevronDown } from "lucide-react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

import type { FaqItem as FaqItemData } from "./faq-data";

export type FaqItemProps = {
  item: FaqItemData;
  className?: string;
};

/**
 * Single FAQ accordion row — question, rotating chevron, animated answer.
 */
export function FaqItem({ item, className }: FaqItemProps) {
  return (
    <AccordionItem
      value={item.id}
      className={cn(
        "border-0 border-b border-[#E5E7EB]",
        className
      )}
    >
      <AccordionTrigger
        className={cn(
          "group/accordion-trigger py-5 sm:py-6",
          "text-left text-[0.9375rem] font-semibold leading-snug text-brand-dark sm:text-base",
          "rounded-none border-0 hover:no-underline",
          "transition-colors duration-300",
          "hover:text-brand-blue",
          "focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
          "**:data-[slot=accordion-trigger-icon]:hidden"
        )}
      >
        <span className="pr-4">{item.question}</span>
        <span
          className={cn(
            "ml-auto flex size-8 shrink-0 items-center justify-center rounded-full",
            "bg-brand-blue/8 text-brand-blue",
            "transition-colors duration-300",
            "group-aria-expanded/accordion-trigger:bg-brand-blue group-aria-expanded/accordion-trigger:text-white"
          )}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300 ease-out",
              "group-aria-expanded/accordion-trigger:rotate-180"
            )}
            strokeWidth={2}
            aria-hidden
          />
        </span>
      </AccordionTrigger>

      <AccordionContent
        className={cn(
          "pb-5 text-sm leading-relaxed text-brand-muted sm:pb-6 sm:text-[0.9375rem]"
        )}
      >
        <p>{item.answer}</p>
      </AccordionContent>
    </AccordionItem>
  );
}
