"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import {
  isDashboardNavActive,
  type DashboardNavItem,
} from "./nav-config";

export type SidebarItemProps = {
  item: DashboardNavItem;
  /** Compact icon-only presentation (tablet collapsed rail). */
  collapsed?: boolean;
  /** Optional unread / count badge (e.g. Inbox). */
  badgeCount?: number;
  onNavigate?: () => void;
  className?: string;
};

const baseItemClassName = cn(
  "group/nav-item relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
  "transition-colors duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
);

function itemStateClassName(
  active: boolean,
  variant: DashboardNavItem["variant"],
  collapsed: boolean,
): string {
  // Icon-rail only applies between `md` and `lg` — desktop stays expanded.
  const rail = collapsed && "md:justify-center md:px-0 lg:justify-start lg:px-3";

  if (variant === "danger") {
    return cn("text-red-600 hover:bg-red-50 hover:text-red-700", rail);
  }

  if (active) {
    return cn(
      "bg-brand-blue/10 text-brand-blue",
      "before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-brand-blue",
      rail,
      collapsed && "md:before:hidden lg:before:block",
    );
  }

  return cn(
    "text-brand-dark/80 hover:bg-brand-blue/[0.06] hover:text-brand-blue",
    rail,
  );
}

function NavBadge({
  count,
  collapsed,
}: {
  count: number;
  collapsed: boolean;
}) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-brand-blue px-1.5 py-0.5",
        "text-[0.625rem] font-semibold leading-none text-white tabular-nums",
        collapsed && "md:absolute md:top-1.5 md:right-1.5 md:ml-0 lg:static lg:ml-auto",
      )}
      aria-label={`${count} unread`}
    >
      {label}
    </span>
  );
}

/**
 * Single sidebar destination — link or logout action.
 * Shared by desktop rail and mobile drawer.
 */
export function SidebarItem({
  item,
  collapsed = false,
  badgeCount = 0,
  onNavigate,
  className,
}: SidebarItemProps) {
  const pathname = usePathname();
  const active = isDashboardNavActive(pathname, item);
  const Icon = item.icon;

  const content = (
    <>
      <Icon
        className={cn(
          "size-[1.125rem] shrink-0",
          item.variant === "danger"
            ? "text-red-600"
            : active
              ? "text-brand-blue"
              : "text-brand-muted group-hover/nav-item:text-brand-blue",
        )}
        strokeWidth={1.75}
        aria-hidden
      />
      <span
        className={cn("truncate", collapsed && "md:hidden lg:inline")}
      >
        {item.label}
        {badgeCount > 0 ? (
          <span className={cn("sr-only")}> ({badgeCount})</span>
        ) : null}
      </span>
      <NavBadge count={badgeCount} collapsed={collapsed} />
    </>
  );

  if (item.action === "logout") {
    return (
      <SignOutButton>
        <button
          type="button"
          title={collapsed ? item.label : undefined}
          aria-label={item.label}
          className={cn(
            baseItemClassName,
            itemStateClassName(false, item.variant, collapsed),
            className,
          )}
          onClick={onNavigate}
        >
          {content}
        </button>
      </SignOutButton>
    );
  }

  const ariaLabel =
    badgeCount > 0 ? `${item.label} (${badgeCount})` : item.label;

  return (
    <Link
      href={item.href}
      title={collapsed ? ariaLabel : undefined}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        baseItemClassName,
        itemStateClassName(active, item.variant, collapsed),
        className,
      )}
    >
      {content}
    </Link>
  );
}
