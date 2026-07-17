import type { Metadata } from "next";

import { ROUTES } from "@/constants/routes";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
};

/**
 * Admin console shell — Clerk session + active Mongo admin role required.
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminPage({
    returnPath: ROUTES.ADMIN.ROOT,
    touchLastLogin: true,
  });

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <p className="text-sm font-medium text-slate-900">Admin console</p>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
