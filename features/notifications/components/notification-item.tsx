"use client";

import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNotificationTime } from "@/features/notifications/lib/format-notification-time";
import {
  getNotificationIcon,
  getNotificationIconClassName,
} from "@/features/notifications/lib/notification-icons";
import type { NotificationListItem } from "@/features/notifications/types";

type NotificationItemProps = {
  item: NotificationListItem;
  pending?: boolean;
  onMarkRead: (item: NotificationListItem) => void;
  onNavigate?: () => void;
};

export function NotificationItem({
  item,
  pending = false,
  onMarkRead,
  onNavigate,
}: NotificationItemProps) {
  const Icon = getNotificationIcon(item.type, item.event);
  const iconClass = getNotificationIconClassName(item.type, item.event);
  const timeLabel = formatNotificationTime(item.createdAt);

  const body = (
    <>
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
          iconClass,
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "text-sm leading-snug text-brand-dark",
              !item.isRead && "font-semibold",
              item.isRead && "font-medium",
            )}
          >
            {item.title}
          </span>
          {!item.isRead ? (
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-blue"
              aria-label="Unread"
            />
          ) : null}
        </span>
        <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-brand-muted">
          {item.description}
        </span>
        <span className="mt-1 block text-[0.6875rem] text-brand-muted/80 tabular-nums">
          {timeLabel}
        </span>
      </span>
    </>
  );

  return (
    <li
      className={cn(
        "group relative flex gap-1 rounded-xl",
        !item.isRead && "bg-brand-blue/[0.04]",
      )}
    >
      {item.href ? (
        <Link
          href={item.href}
          onClick={() => {
            if (!item.isRead) {
              onMarkRead(item);
            }
            onNavigate?.();
          }}
          className={cn(
            "flex min-w-0 flex-1 gap-3 rounded-xl px-2.5 py-2.5 text-left",
            "transition-colors hover:bg-brand-blue/[0.06]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40",
          )}
        >
          {body}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!item.isRead) {
              onMarkRead(item);
            }
          }}
          disabled={pending}
          className={cn(
            "flex min-w-0 flex-1 gap-3 rounded-xl px-2.5 py-2.5 text-left",
            "transition-colors hover:bg-brand-blue/[0.06]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40",
          )}
        >
          {body}
        </button>
      )}

      {!item.isRead ? (
        <div className="flex shrink-0 items-start pt-2 pr-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-brand-muted hover:bg-brand-blue/10 hover:text-brand-blue"
            disabled={pending}
            aria-label={`Mark "${item.title}" as read`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onMarkRead(item);
            }}
          >
            <CheckIcon className="size-3.5" aria-hidden />
          </Button>
        </div>
      ) : null}
    </li>
  );
}
