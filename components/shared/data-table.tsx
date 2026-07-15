import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { EmptyState } from "./empty-state";
import { LoadingState } from "./loading-state";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** Desktop / table cell. */
  cell: (row: T) => ReactNode;
  /** Optional mobile card row label. Defaults to header string when possible. */
  mobileLabel?: string;
  className?: string;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Custom mobile card body. Falls back to labeled key/value list. */
  renderMobileRow?: (row: T) => ReactNode;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  className?: string;
  caption?: string;
};

/**
 * Mobile-first data surface: card stack on small screens, table from `md` up.
 * No fetch/sort logic — features supply rows and column renderers.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  renderMobileRow,
  isLoading = false,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting filters or create a new record.",
  emptyAction,
  className,
  caption,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingState variant="skeleton" rows={5} className={className} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile card list */}
      <ul className="flex flex-col gap-3 md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li
            key={getRowId(row)}
            className="rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10"
          >
            {renderMobileRow ? (
              renderMobileRow(row)
            ) : (
              <dl className="flex flex-col gap-2">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="text-muted-foreground">
                      {column.mobileLabel ??
                        (typeof column.header === "string"
                          ? column.header
                          : column.id)}
                    </dt>
                    <dd className="min-w-0 text-right font-medium text-foreground">
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          {caption ? (
            <caption className="sr-only">{caption}</caption>
          ) : null}
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
