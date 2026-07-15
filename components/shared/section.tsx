import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  /** Optional header actions (filters, “Add”, etc.). */
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
};

/**
 * One-job content section shared across public, patient, and admin screens.
 * Prefer one headline + short description, then content — mobile-first stacking.
 */
export function Section({
  title,
  description,
  children,
  actions,
  className,
  contentClassName,
  id,
}: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn("flex flex-col gap-4", className)}
    >
      {title || description || actions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h2
                id={headingId}
                className="font-heading text-lg font-semibold tracking-tight text-foreground"
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={cn(contentClassName)}>{children}</div>
    </section>
  );
}
