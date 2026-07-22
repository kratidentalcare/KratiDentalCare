import type { Metadata } from "next";

import { DashboardShell, type DashboardUser } from "@/components/dashboard";
import { ROUTES } from "@/constants/routes";
import { countUnreadContactMessages } from "@/features/contact/services/list-contact-messages";
import { getNotificationCenterData } from "@/features/notifications/services/get-notification-center-data";
import type { NotificationCenterData } from "@/features/notifications/types";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Admin dashboard layout — auth gate + reusable shell.
 * Nested module pages under `/dashboard/*` inherit sidebar, header, and chrome.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appUser = await requireAdminPage({
    returnPath: ROUTES.DASHBOARD.ROOT,
    touchLastLogin: true,
  });

  const user: DashboardUser = {
    firstName: appUser.firstName,
    lastName: appUser.lastName,
    email: appUser.email,
    profileImage: appUser.profileImage,
  };

  let inboxUnreadCount = 0;
  try {
    inboxUnreadCount = await countUnreadContactMessages();
  } catch {
    inboxUnreadCount = 0;
  }

  let notifications: NotificationCenterData = { items: [], unreadCount: 0 };
  try {
    notifications = await getNotificationCenterData();
  } catch {
    notifications = { items: [], unreadCount: 0 };
  }

  return (
    <DashboardShell
      user={user}
      inboxUnreadCount={inboxUnreadCount}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
