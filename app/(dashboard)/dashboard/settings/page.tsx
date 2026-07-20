import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { ClinicSettingsWorkspace } from "@/features/clinic-settings/components/clinic-settings-workspace";
import { toClinicSettingsView } from "@/features/clinic-settings/types";
import { listBookableDoctors } from "@/features/appointments/services/list-doctors";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { PERMISSIONS, requirePermission } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Clinic Settings",
};

/**
 * Admin Clinic Settings — centralized identity, contact, footer, and
 * default doctor. Scheduling edits stay on Dashboard → Scheduling.
 */
export default async function ClinicSettingsPage() {
  await requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE);

  const [settings, doctors] = await Promise.all([
    getOrCreateClinicSettings(),
    listBookableDoctors(),
  ]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Clinic Settings"
        description="Manage clinic identity, contact details, Footer content, and the default booking doctor. Working hours and holidays are configured under Scheduling."
      />
      <ClinicSettingsWorkspace
        initialSettings={toClinicSettingsView(settings)}
        doctors={doctors}
      />
    </div>
  );
}
