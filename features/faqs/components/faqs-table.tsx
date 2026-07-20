"use client";

import {
  EyeIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FaqListItem } from "@/features/faqs/types";

const ANSWER_PREVIEW_LENGTH = 80;

function truncateAnswer(answer: string): string {
  const trimmed = answer.trim();
  if (trimmed.length <= ANSWER_PREVIEW_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, ANSWER_PREVIEW_LENGTH).trimEnd()}…`;
}

function formatCreatedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

type FaqsTableProps = {
  items: FaqListItem[];
  onEdit: (faq: FaqListItem) => void;
  onToggleVisibility: (faq: FaqListItem) => void;
  onDelete: (faq: FaqListItem) => void;
};

export function FaqsTable({
  items,
  onEdit,
  onToggleVisibility,
  onDelete,
}: FaqsTableProps) {
  const columns: DataTableColumn<FaqListItem>[] = [
    {
      id: "question",
      header: "Question",
      cell: (row) => (
        <span className="line-clamp-2 max-w-[18rem] font-medium text-brand-dark lg:max-w-md">
          {row.question}
        </span>
      ),
    },
    {
      id: "answer",
      header: "Answer",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="line-clamp-2 max-w-sm text-muted-foreground">
          {truncateAnswer(row.answer)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) =>
        row.isActive ? (
          <Badge
            variant="secondary"
            className="border-emerald-200 bg-emerald-50 text-emerald-900"
          >
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Hidden
          </Badge>
        ),
    },
    {
      id: "displayOrder",
      header: "Order",
      cell: (row) => (
        <span className="tabular-nums text-brand-dark">{row.displayOrder}</span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatCreatedDate(row.createdAt)}
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
                aria-label={`Actions for ${row.question}`}
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
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => onToggleVisibility(row)}
            >
              {row.isActive ? (
                <>
                  <EyeOffIcon className="size-4" />
                  Hide
                </>
              ) : (
                <>
                  <EyeIcon className="size-4" />
                  Show
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2"
              onClick={() => onDelete(row)}
            >
              <Trash2Icon className="size-4" />
              Delete
            </DropdownMenuItem>
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
      caption="FAQs"
      emptyTitle="No FAQs yet"
      emptyDescription="Add your first FAQ to show it on the public homepage."
      renderMobileRow={(row) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-brand-dark">{row.question}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {truncateAnswer(row.answer)}
              </p>
            </div>
            {row.isActive ? (
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
                Hidden
              </Badge>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Order</dt>
              <dd className="font-medium tabular-nums">{row.displayOrder}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">{formatCreatedDate(row.createdAt)}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onEdit(row)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onToggleVisibility(row)}
            >
              {row.isActive ? "Hide" : "Show"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => onDelete(row)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    />
  );
}
