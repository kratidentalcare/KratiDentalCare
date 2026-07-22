"use client";

import type { ReactNode } from "react";

import type { NotificationCenterData } from "@/features/notifications/types";
import { cn } from "@/lib/utils";

import { DashboardChromeProvider } from "./dashboard-chrome-context";
import { Header } from "./header";
import { MobileSidebar } from "./mobile-sidebar";
import { Sidebar } from "./sidebar";
import type { DashboardUser } from "./user-menu";

export type DashboardShellProps = {
  children: ReactNode;
  user: DashboardUser;
  /** Unread contact inquiries for sidebar Inbox badge. */
  inboxUnreadCount?: number;
  /** Notification Center seed (bell badge + panel). */
  notifications?: NotificationCenterData;
  className?: string;
};

const EMPTY_NOTIFICATIONS: NotificationCenterData = {
  items: [],
  unreadCount: 0,
};

const MAIN_CONTENT_ID = "dashboard-main";

/**
 * Reusable admin chrome — sidebar, mobile drawer, header, and main slot.
 * Nested `app/(dashboard)/dashboard/**` pages inherit this without changes.
 */
export function DashboardShell({
  children,
  user,
  inboxUnreadCount = 0,
  notifications = EMPTY_NOTIFICATIONS,
  className,
}: DashboardShellProps) {
  return (
    <DashboardChromeProvider>
      <div
        className={cn(
          "flex min-h-full flex-1 bg-brand-surface font-montserrat text-brand-dark",
          className,
        )}
      >
        <a
          href={`#${MAIN_CONTENT_ID}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-dark focus:shadow-md focus:ring-2 focus:ring-brand-blue/40"
        >
          Skip to main content
        </a>

        <Sidebar inboxUnreadCount={inboxUnreadCount} />
        <MobileSidebar inboxUnreadCount={inboxUnreadCount} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header user={user} notifications={notifications} />
          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="flex-1 outline-none"
          >
            <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardChromeProvider>
  );
}
