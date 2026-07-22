"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions";
import { NotificationPanel } from "@/features/notifications/components/notification-panel";
import type {
  NotificationCenterData,
  NotificationListItem,
} from "@/features/notifications/types";
import { cn } from "@/lib/utils";

export type NotificationBellProps = {
  initialData: NotificationCenterData;
  className?: string;
};

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "absolute -top-0.5 -right-0.5 inline-flex min-w-5 items-center justify-center",
        "rounded-full bg-brand-blue px-1 py-0.5",
        "text-[0.625rem] font-semibold leading-none text-white tabular-nums",
        "ring-2 ring-white",
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}

/**
 * Header notification bell — reuses the existing chrome slot.
 * Desktop: Popover. Mobile: Sheet. (CSS-gated, no hydration flash.)
 */
export function NotificationBell({
  initialData,
  className,
}: NotificationBellProps) {
  const router = useRouter();
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [items, setItems] = useState(initialData.items);
  const [unreadCount, setUnreadCount] = useState(initialData.unreadCount);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(initialData.items);
    setUnreadCount(initialData.unreadCount);
  }, [initialData]);

  const refreshFromServer = () => {
    startTransition(async () => {
      const result = await listNotificationsAction();
      if (result.success) {
        setItems(result.data.items);
        setUnreadCount(result.data.unreadCount);
      }
    });
  };

  const handleDesktopOpenChange = (next: boolean) => {
    setDesktopOpen(next);
    if (next) {
      refreshFromServer();
    }
  };

  const handleMobileOpenChange = (next: boolean) => {
    setMobileOpen(next);
    if (next) {
      refreshFromServer();
    }
  };

  const handleMarkRead = (item: NotificationListItem) => {
    if (item.isRead) return;

    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id
          ? { ...row, isRead: true, readAt: new Date().toISOString() }
          : row,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    startTransition(async () => {
      const result = await markNotificationReadAction({ id: item.id });
      if (!result.success) {
        refreshFromServer();
        return;
      }
      router.refresh();
    });
  };

  const handleMarkAllRead = () => {
    if (unreadCount <= 0) return;

    setItems((prev) =>
      prev.map((row) =>
        row.isRead
          ? row
          : { ...row, isRead: true, readAt: new Date().toISOString() },
      ),
    );
    setUnreadCount(0);

    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.success) {
        refreshFromServer();
        return;
      }
      router.refresh();
    });
  };

  const closePanels = () => {
    setDesktopOpen(false);
    setMobileOpen(false);
  };

  const ariaLabel =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : "Notifications";

  const triggerClassName = cn(
    "relative text-brand-muted hover:bg-brand-blue/10 hover:text-brand-blue",
    className,
  );

  const panelProps = {
    items,
    unreadCount,
    pending,
    onMarkRead: handleMarkRead,
    onMarkAllRead: handleMarkAllRead,
    onNavigate: closePanels,
  };

  return (
    <>
      {/* Desktop — Popover */}
      <div className="hidden md:block">
        <Popover open={desktopOpen} onOpenChange={handleDesktopOpenChange}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={triggerClassName}
                aria-label={ariaLabel}
              />
            }
          >
            <BellIcon className="size-5" aria-hidden />
            <UnreadBadge count={unreadCount} />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[min(24rem,calc(100vw-1.5rem))] gap-0 overflow-hidden p-0"
          >
            <NotificationPanel {...panelProps} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile — Sheet */}
      <div className="md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={triggerClassName}
          aria-label={ariaLabel}
          onClick={() => handleMobileOpenChange(true)}
        >
          <BellIcon className="size-5" aria-hidden />
          <UnreadBadge count={unreadCount} />
        </Button>

        <Sheet open={mobileOpen} onOpenChange={handleMobileOpenChange}>
          <SheetContent
            side="right"
            className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
            showCloseButton
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <NotificationPanel {...panelProps} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
