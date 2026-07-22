import type { Metadata } from "next";

import {
  DoctorsDirectory,
  DoctorsPageHero,
} from "@/components/website/doctors-page";
import { ServicesFinalCta } from "@/components/website/services-page";
import { APP_NAME } from "@/constants";
import { getPublicFooterData } from "@/features/clinic-settings";
import { formatClinicWorkingHours } from "@/features/clinic-settings/lib/format-clinic";
import { listPublicDoctors } from "@/features/doctors";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";

export const metadata: Metadata = {
  title: "Doctors",
  description: `Meet the dentists at ${APP_NAME} — experienced clinicians dedicated to gentle, precise dental care.`,
};

/**
 * Dedicated public Doctors page.
 * Profiles come from the Doctor model; CTA reuses the Services closing band.
 */
export default async function DoctorsPage() {
  const [doctors, footerData, clinicSettings] = await Promise.all([
    listPublicDoctors().catch(() => [] as Awaited<
      ReturnType<typeof listPublicDoctors>
    >),
    getPublicFooterData(),
    getOrCreateClinicSettings().catch(() => null),
  ]);

  const clinicHoursLabel = clinicSettings
    ? formatClinicWorkingHours(clinicSettings)
    : null;

  return (
    <div className="flex flex-1 flex-col">
      <DoctorsPageHero />
      <DoctorsDirectory
        doctors={doctors}
        clinicHoursLabel={clinicHoursLabel}
      />
      <ServicesFinalCta
        phone={footerData?.contact.phone}
        phoneHref={footerData?.contact.phoneHref}
      />
    </div>
  );
}
