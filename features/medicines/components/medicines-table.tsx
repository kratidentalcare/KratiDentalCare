"use client";

import {
  Archive,
  MoreHorizontalIcon,
  PencilIcon,
  RotateCcwIcon,
} from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MEDICINE_STATUSES } from "@/constants/statuses";
import type { MedicineListItem } from "@/features/medicines/types";

function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function truncate(value: string | null, max = 40): string {
  if (!value) {
    return "—";
  }
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

type MedicinesTableProps = {
  items: MedicineListItem[];
  onEdit: (item: MedicineListItem) => void;
  onArchive: (item: MedicineListItem) => void;
  onRestore: (item: MedicineListItem) => void;
};

export function MedicinesTable({
  items,
  onEdit,
  onArchive,
  onRestore,
}: MedicinesTableProps) {
  const columns: DataTableColumn<MedicineListItem>[] = [
    {
      id: "name",
      header: "Medicine Name",
      cell: (row) => (
        <span className="font-medium text-brand-dark">{row.name}</span>
      ),
    },
    {
      id: "genericName",
      header: "Generic Name",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-muted-foreground">{row.genericName ?? "—"}</span>
      ),
    },
    {
      id: "dosage",
      header: "Dosage",
      className: "hidden md:table-cell",
      cell: (row) => row.dosage,
    },
    {
      id: "frequency",
      header: "Frequency",
      className: "hidden md:table-cell",
      cell: (row) => row.frequency,
    },
    {
      id: "duration",
      header: "Duration",
      className: "hidden xl:table-cell",
      cell: (row) => row.duration,
    },
    {
      id: "instructions",
      header: "Instructions",
      className: "hidden xl:table-cell",
      cell: (row) => (
        <span className="text-muted-foreground">
          {truncate(row.instructions)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) =>
        row.status === MEDICINE_STATUSES.ACTIVE ? (
          <Badge
            variant="secondary"
            className="border-emerald-200 bg-emerald-50 text-emerald-900"
          >
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Archived
          </Badge>
        ),
    },
    {
      id: "updatedAt",
      header: "Updated At",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatUpdatedAt(row.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-12 text-right",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.name}`}
              />
            }
          >
            <MoreHorizontalIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => onEdit(row)}
            >
              <PencilIcon className="size-4" />
              Edit
            </DropdownMenuItem>
            {row.status === MEDICINE_STATUSES.ACTIVE ? (
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer gap-2"
                onClick={() => onArchive(row)}
              >
                <Archive className="size-4" />
                Archive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onRestore(row)}
              >
                <RotateCcwIcon className="size-4" />
                Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      getRowId={(row) => row.id}
      caption="Medicines"
      emptyTitle="No medicines yet"
      emptyDescription="Add a medicine to make it available in E-Prescriptions."
      renderMobileRow={(row) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-brand-dark">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {row.genericName ?? "No generic name"}
              </p>
            </div>
            {row.status === MEDICINE_STATUSES.ACTIVE ? (
              <Badge
                variant="secondary"
                className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-900"
              >
                Active
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="shrink-0 text-muted-foreground"
              >
                Archived
              </Badge>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Dosage</dt>
              <dd className="font-medium">{row.dosage}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Frequency</dt>
              <dd className="font-medium">{row.frequency}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium">{row.duration}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="font-medium">{formatUpdatedAt(row.updatedAt)}</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">
            {row.instructions ?? "No instructions"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onEdit(row)}
            >
              Edit
            </Button>
            {row.status === MEDICINE_STATUSES.ACTIVE ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => onArchive(row)}
              >
                Archive
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onRestore(row)}
              >
                Restore
              </Button>
            )}
          </div>
        </div>
      )}
    />
  );
}
