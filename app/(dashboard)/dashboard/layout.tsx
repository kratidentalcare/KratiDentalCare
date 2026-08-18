import { Suspense } from "react";

import type { Metadata } from "next";

import { DashboardShell, type DashboardUser } from "@/components/dashboard";
import {
  DashboardInboxSidebar,
  DashboardMobileInboxSidebar,
} from "@/components/dashboard/dashboard-inbox-sidebar";
import {
  DashboardNotificationBell,
  EMPTY_NOTIFICATION_CENTER,
} from "@/components/dashboard/dashboard-notifications";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ROUTES } from "@/constants/routes";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Admin dashboard layout — auth gate + reusable shell.
 * Nested module pages under `/dashboard/*` inherit sidebar, header, and chrome.
 *
 * Inbox + notifications stream behind Suspense so they do not block
 * `loading.tsx` for the page segment.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appUser = await requireAdminPage({
    returnPath: ROUTES.DASHBOARD.ROOT,
    touchLastLogin: false,
  });

  const user: DashboardUser = {
    firstName: appUser.firstName,
    lastName: appUser.lastName,
    email: appUser.email,
    profileImage: appUser.profileImage,
  };

  return (
    <DashboardShell
      user={user}
      sidebar={
        <Suspense fallback={<Sidebar inboxUnreadCount={0} />}>
          <DashboardInboxSidebar />
        </Suspense>
      }
      mobileSidebar={
        <Suspense fallback={<MobileSidebar inboxUnreadCount={0} />}>
          <DashboardMobileInboxSidebar />
        </Suspense>
      }
      notifications={
        <Suspense
          fallback={
            <NotificationBell initialData={EMPTY_NOTIFICATION_CENTER} />
          }
        >
          <DashboardNotificationBell />
        </Suspense>
      }
    >
      {children}
    </DashboardShell>
  );
}
