"use client";

import {
  ArchiveIcon,
  EyeIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";

import { DataTable, StatusBadge, type DataTableColumn } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CONTACT_MESSAGE_STATUSES } from "@/constants/statuses";
import type { ContactMessageListItem } from "@/features/contact/types";
import { cn } from "@/lib/utils";

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

type InboxTableProps = {
  items: ContactMessageListItem[];
  onOpen: (item: ContactMessageListItem) => void;
  onMarkRead: (item: ContactMessageListItem) => void;
  onMarkUnread: (item: ContactMessageListItem) => void;
  onArchive: (item: ContactMessageListItem) => void;
  onDelete: (item: ContactMessageListItem) => void;
};

export function InboxTable({
  items,
  onOpen,
  onMarkRead,
  onMarkUnread,
  onArchive,
  onDelete,
}: InboxTableProps) {
  const columns: DataTableColumn<ContactMessageListItem>[] = [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <button
          type="button"
          className="flex max-w-[12rem] flex-col items-start gap-1 text-left lg:max-w-[16rem]"
          onClick={() => onOpen(row)}
        >
          <span
            className={cn(
              "line-clamp-1 font-medium text-brand-dark",
              !row.isRead && "font-semibold",
            )}
          >
            {row.name}
          </span>
          {!row.isRead ? (
            <Badge
              variant="secondary"
              className="border-sky-200 bg-sky-50 text-[0.625rem] text-sky-900"
            >
              Unread
            </Badge>
          ) : null}
        </button>
      ),
    },
    {
      id: "email",
      header: "Email",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="line-clamp-1 max-w-[14rem] text-muted-foreground">
          {row.email}
        </span>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">{row.phone}</span>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: (row) => (
        <button
          type="button"
          className="line-clamp-1 max-w-[12rem] text-left text-brand-dark lg:max-w-xs"
          onClick={() => onOpen(row)}
        >
          {row.subject}
        </button>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "createdAt",
      header: "Created At",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatCreatedAt(row.createdAt)}
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
                aria-label={`Actions for ${row.subject}`}
              />
            }
          >
            <MoreHorizontalIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => onOpen(row)}
            >
              <EyeIcon className="size-4" />
              View
            </DropdownMenuItem>
            {row.status === CONTACT_MESSAGE_STATUSES.NEW ? (
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onMarkRead(row)}
              >
                <EyeIcon className="size-4" />
                Mark as Read
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onMarkUnread(row)}
              >
                <EyeOffIcon className="size-4" />
                Mark as Unread
              </DropdownMenuItem>
            )}
            {row.status !== CONTACT_MESSAGE_STATUSES.ARCHIVED ? (
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onArchive(row)}
              >
                <ArchiveIcon className="size-4" />
                Archive
              </DropdownMenuItem>
            ) : null}
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
      caption="Contact inquiries"
      emptyTitle="No inquiries yet"
      emptyDescription="Messages submitted from the public contact form will appear here."
      renderMobileRow={(row) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              className="min-w-0 space-y-1 text-left"
              onClick={() => onOpen(row)}
            >
              <p
                className={cn(
                  "font-medium text-brand-dark",
                  !row.isRead && "font-semibold",
                )}
              >
                {row.name}
              </p>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {row.subject}
              </p>
            </button>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StatusBadge status={row.status} />
              {!row.isRead ? (
                <Badge
                  variant="secondary"
                  className="border-sky-200 bg-sky-50 text-[0.625rem] text-sky-900"
                >
                  Unread
                </Badge>
              ) : null}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate font-medium">{row.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium tabular-nums">{row.phone}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">{formatCreatedAt(row.createdAt)}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOpen(row)}
            >
              View
            </Button>
            {row.status === CONTACT_MESSAGE_STATUSES.NEW ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onMarkRead(row)}
              >
                Mark Read
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onMarkUnread(row)}
              >
                Mark Unread
              </Button>
            )}
            {row.status !== CONTACT_MESSAGE_STATUSES.ARCHIVED ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onArchive(row)}
              >
                Archive
              </Button>
            ) : null}
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
