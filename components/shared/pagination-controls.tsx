"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
};

/**
 * Presentational pagination for admin/patient lists.
 * Features own the page state (often URL search params).
 */
export function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
  className,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);
  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {totalItems === 0
          ? "No items"
          : `Showing ${from}–${to} of ${totalItems}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev}
          aria-label="Previous page"
          onClick={() => {
            onPageChange(safePage - 1);
          }}
        >
          <ChevronLeftIcon />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <span className="min-w-16 text-center text-sm tabular-nums text-foreground">
          {safePage} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext}
          aria-label="Next page"
          onClick={() => {
            onPageChange(safePage + 1);
          }}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon />
        </Button>
      </div>
    </nav>
  );
}
