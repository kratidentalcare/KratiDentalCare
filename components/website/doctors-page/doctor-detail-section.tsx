import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DoctorDetailSectionProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
};

/**
 * Shared section chrome for biography, education, certifications, etc.
 */
export function DoctorDetailSection({
  title,
  icon: Icon,
  children,
  className,
}: DoctorDetailSectionProps) {
  return (
    <section className={cn("min-w-0", className)}>
      <header className="mb-4 flex items-center gap-2.5 sm:mb-5">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            "bg-brand-blue/10"
          )}
        >
          <Icon
            className="size-4 text-brand-blue"
            strokeWidth={1.75}
            aria-hidden
          />
        </span>
        <h3 className="font-serif text-xl font-medium tracking-tight text-brand-dark sm:text-2xl">
          {title}
        </h3>
      </header>
      {children}
    </section>
  );
}

export type DoctorDetailListProps = {
  items: readonly string[];
  emptyMessage: string;
  className?: string;
};

export function DoctorDetailList({
  items,
  emptyMessage,
  className,
}: DoctorDetailListProps) {
  if (items.length === 0) {
    return (
      <p className={cn("text-sm leading-relaxed text-brand-muted", className)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex gap-2.5 text-sm leading-relaxed text-brand-dark",
            "sm:text-[0.9375rem]"
          )}
        >
          <span
            className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-teal"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
