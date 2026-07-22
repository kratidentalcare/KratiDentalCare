"use client";

import { BellOffIcon, CheckCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import type { NotificationListItem } from "@/features/notifications/types";
import { cn } from "@/lib/utils";

type NotificationPanelProps = {
  items: NotificationListItem[];
  unreadCount: number;
  pending?: boolean;
  onMarkRead: (item: NotificationListItem) => void;
  onMarkAllRead: () => void;
  onNavigate?: () => void;
  className?: string;
};

export function NotificationPanel({
  items,
  unreadCount,
  pending = false,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  className,
}: NotificationPanelProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-3 py-2.5 sm:px-3.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-dark">Notifications</p>
          <p className="text-xs text-brand-muted">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-xs text-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue"
            disabled={pending}
            onClick={onMarkAllRead}
          >
            <CheckCheckIcon className="size-3.5" aria-hidden />
            Mark all read
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
            <BellOffIcon className="size-5" aria-hidden />
          </span>
          <p className="text-sm font-medium text-brand-dark">
            No new notifications
          </p>
          <p className="max-w-[16rem] text-xs text-brand-muted">
            New appointments and contact inquiries will show up here.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[min(24rem,60vh)]">
          <ul className="flex flex-col gap-0.5 p-1.5" role="list">
            {items.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                pending={pending}
                onMarkRead={onMarkRead}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
