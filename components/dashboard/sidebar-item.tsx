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

/**
 * Single sidebar destination — link or logout action.
 * Shared by desktop rail and mobile drawer.
 */
export function SidebarItem({
  item,
  collapsed = false,
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
      </span>
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

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
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
