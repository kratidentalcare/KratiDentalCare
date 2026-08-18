import { DoctorsDirectory } from "@/components/website/doctors-page/doctors-directory";
import { formatClinicWorkingHours } from "@/features/clinic-settings/lib/format-clinic";
import { listPublicDoctors } from "@/features/doctors";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";

/**
 * Doctor profiles + hours from Mongo, streamed so the page hero paints first.
 */
export async function StreamedDoctorsDirectory() {
  const [doctors, clinicSettings] = await Promise.all([
    listPublicDoctors().catch(() => [] as Awaited<
      ReturnType<typeof listPublicDoctors>
    >),
    getOrCreateClinicSettings().catch(() => null),
  ]);

  const clinicHoursLabel = clinicSettings
    ? formatClinicWorkingHours(clinicSettings)
    : null;

  return (
    <DoctorsDirectory doctors={doctors} clinicHoursLabel={clinicHoursLabel} />
  );
}
