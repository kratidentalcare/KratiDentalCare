"use client";

import Link from "next/link";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useDashboardChrome } from "./dashboard-chrome-context";
import { DASHBOARD_NAV_ITEMS } from "./nav-config";
import { SidebarItem } from "./sidebar-item";

export type SidebarProps = {
  className?: string;
  /** Unread contact inquiries for Inbox badge. */
  inboxUnreadCount?: number;
};

/**
 * Permanent (desktop) / collapsible (tablet) navigation rail.
 * Hidden below `md` — mobile uses {@link MobileSidebar}.
 */
export function Sidebar({ className, inboxUnreadCount = 0 }: SidebarProps) {
  const { collapsed, toggleCollapsed } = useDashboardChrome();

  const primaryItems = DASHBOARD_NAV_ITEMS.filter(
    (item) => item.id !== "logout" && item.id !== "profile",
  );
  const accountItems = DASHBOARD_NAV_ITEMS.filter(
    (item) => item.id === "profile" || item.id === "logout",
  );

  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      aria-label="Dashboard navigation"
      className={cn(
        "sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r border-[#E5E7EB] bg-white",
        "transition-[width] duration-200 ease-out",
        "md:flex",
        // Tablet: respect collapse. Desktop (lg+): permanent expanded rail.
        collapsed ? "md:w-16 lg:w-64" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2 border-b border-[#E5E7EB] px-3",
          "lg:h-16 lg:px-4",
        )}
      >
        <Link
          href={ROUTES.DASHBOARD.ROOT}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-lg outline-none",
            "focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
            collapsed && "md:justify-center lg:justify-start",
          )}
          aria-label={`${APP_NAME} dashboard`}
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue"
            aria-hidden
          >
            <span className="font-serif text-lg font-semibold leading-none">
              K
            </span>
          </span>
          <span
            className={cn(
              "min-w-0 flex-col",
              collapsed ? "hidden lg:flex" : "flex",
            )}
          >
            <span className="truncate text-sm font-semibold tracking-tight text-brand-dark">
              Krati Dental
            </span>
            <span className="truncate text-[0.6875rem] font-medium tracking-wide text-brand-muted uppercase">
              Admin
            </span>
          </span>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            "hidden shrink-0 text-brand-muted hover:bg-brand-blue/10 hover:text-brand-blue lg:hidden",
            "md:inline-flex",
          )}
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpenIcon className="size-4" aria-hidden />
          ) : (
            <PanelLeftCloseIcon className="size-4" aria-hidden />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-3 lg:px-3">
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {primaryItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              badgeCount={item.id === "inbox" ? inboxUnreadCount : 0}
            />
          ))}
        </nav>

        <Separator className="my-3 bg-[#E5E7EB]" />

        <nav aria-label="Account" className="flex flex-col gap-1">
          {accountItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
