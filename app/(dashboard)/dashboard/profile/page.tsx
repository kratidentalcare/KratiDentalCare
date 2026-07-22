import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { ProfileWorkspace } from "@/features/profile/components/profile-workspace";
import { toAdminProfileView } from "@/features/profile/services/map-admin-profile";
import { ROUTES } from "@/constants/routes";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Profile",
};

/**
 * Admin My Profile — identity overview, editable details, Clerk security.
 */
export default async function DashboardProfilePage() {
  const user = await requireAdminPage({
    returnPath: ROUTES.DASHBOARD.PROFILE,
    touchLastLogin: false,
  });

  const profile = toAdminProfileView(user);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="My Profile"
        description="View and update your admin account details. Passwords and email security stay with Clerk."
      />
      <ProfileWorkspace initialProfile={profile} />
    </div>
  );
}
