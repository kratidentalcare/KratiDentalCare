import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** Primary / secondary actions (stack under title on mobile, align right on desktop). */
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
};

/**
 * Standard page chrome for admin and patient surfaces.
 * Mobile-first: title + description first, actions full-width below, side-by-side from `sm`.
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        {breadcrumbs ? <div className="min-w-0">{breadcrumbs}</div> : null}
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
