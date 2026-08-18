"use client";

import type { ReactNode } from "react";
import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DashboardBreadcrumb } from "./breadcrumb";
import { useDashboardChrome } from "./dashboard-chrome-context";
import { getDashboardPageTitle } from "./nav-config";
import { UserMenu, type DashboardUser } from "./user-menu";

export type HeaderProps = {
  user: DashboardUser;
  /** Notification bell slot (Suspense-wrapped server child). */
  notifications: ReactNode;
  className?: string;
};

/**
 * Top chrome: mobile menu, page title, breadcrumb, notifications, user menu.
 */
export function Header({ user, notifications, className }: HeaderProps) {
  const { openMobile, collapsed, toggleCollapsed, displayPath } =
    useDashboardChrome();
  const title = getDashboardPageTitle(displayPath);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:h-16 lg:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-brand-dark hover:bg-brand-blue/10 hover:text-brand-blue md:hidden"
          onClick={openMobile}
          aria-label="Open navigation menu"
        >
          <MenuIcon className="size-5" aria-hidden />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "hidden shrink-0 text-brand-dark hover:bg-brand-blue/10 hover:text-brand-blue",
            "md:inline-flex lg:hidden",
          )}
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpenIcon className="size-5" aria-hidden />
          ) : (
            <PanelLeftCloseIcon className="size-5" aria-hidden />
          )}
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold tracking-tight text-brand-dark sm:text-lg">
            {title}
          </h1>
          <DashboardBreadcrumb className="mt-0.5 hidden sm:block" />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {notifications}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
