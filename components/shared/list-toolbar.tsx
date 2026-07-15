import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ListToolbarProps = {
  /** Typically SearchInput or filters. */
  start?: ReactNode;
  /** Primary actions (Create, Export). */
  end?: ReactNode;
  className?: string;
};

/**
 * List toolbar row: search/filters left, actions right.
 * Stacks on mobile to avoid cramped controls.
 */
export function ListToolbar({ start, end, className }: ListToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {start ? <div className="min-w-0 flex-1">{start}</div> : null}
      {end ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
          {end}
        </div>
      ) : null}
    </div>
  );
}
