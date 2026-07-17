import type { Metadata } from "next";

import { DashboardShell, type DashboardUser } from "@/components/dashboard";
import { ROUTES } from "@/constants/routes";
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

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
