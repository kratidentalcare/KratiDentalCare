"use client";

import {
  ArchiveIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  PhoneIcon,
  Trash2Icon,
} from "lucide-react";

import { StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CONTACT_MESSAGE_STATUSES } from "@/constants/statuses";
import type { ContactMessageListItem } from "@/features/contact/types";

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

type InboxMessageSheetProps = {
  message: ContactMessageListItem | null;
  open: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkRead: (item: ContactMessageListItem) => void;
  onMarkUnread: (item: ContactMessageListItem) => void;
  onArchive: (item: ContactMessageListItem) => void;
  onDelete: (item: ContactMessageListItem) => void;
};

export function InboxMessageSheet({
  message,
  open,
  pending = false,
  onOpenChange,
  onMarkRead,
  onMarkUnread,
  onArchive,
  onDelete,
}: InboxMessageSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 sm:max-w-lg"
      >
        {message ? (
          <>
            <SheetHeader className="border-b border-[#E5E7EB] text-left">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={message.status} />
                {!message.isRead ? (
                  <Badge
                    variant="secondary"
                    className="border-sky-200 bg-sky-50 text-sky-900"
                  >
                    Unread
                  </Badge>
                ) : null}
              </div>
              <SheetTitle className="font-montserrat text-lg text-brand-dark">
                {message.subject}
              </SheetTitle>
              <SheetDescription>
                Received {formatCreatedAt(message.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
              <dl className="grid gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="mt-1 font-medium text-brand-dark">
                    {message.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${message.email}`}
                      className="inline-flex items-center gap-1.5 font-medium text-brand-blue hover:underline"
                    >
                      <MailIcon className="size-3.5 shrink-0" aria-hidden />
                      {message.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${message.phone}`}
                      className="inline-flex items-center gap-1.5 font-medium text-brand-blue hover:underline"
                    >
                      <PhoneIcon className="size-3.5 shrink-0" aria-hidden />
                      {message.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Subject</dt>
                  <dd className="mt-1 font-medium text-brand-dark">
                    {message.subject}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={message.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created Date</dt>
                  <dd className="mt-1 font-medium text-brand-dark">
                    {formatCreatedAt(message.createdAt)}
                  </dd>
                </div>
              </dl>

              <Separator className="bg-[#E5E7EB]" />

              <div>
                <p className="text-sm text-muted-foreground">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-dark">
                  {message.message}
                </p>
              </div>
            </div>

            <SheetFooter className="border-t border-[#E5E7EB] sm:flex-row sm:flex-wrap">
              {message.status === CONTACT_MESSAGE_STATUSES.NEW ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={pending}
                  onClick={() => onMarkRead(message)}
                >
                  <EyeIcon className="size-4" />
                  Mark as Read
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={pending}
                  onClick={() => onMarkUnread(message)}
                >
                  <EyeOffIcon className="size-4" />
                  Mark as Unread
                </Button>
              )}
              {message.status !== CONTACT_MESSAGE_STATUSES.ARCHIVED ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={pending}
                  onClick={() => onArchive(message)}
                >
                  <ArchiveIcon className="size-4" />
                  Archive
                </Button>
              ) : null}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-xl"
                disabled={pending}
                onClick={() => onDelete(message)}
              >
                <Trash2Icon className="size-4" />
                Delete
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
