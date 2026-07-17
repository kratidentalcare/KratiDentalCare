import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { SchedulingWorkspace } from "@/features/scheduling/components/scheduling-workspace";
import { DefaultDoctorSettings } from "@/features/scheduling/components/default-doctor-settings";
import { listBookableDoctors } from "@/features/appointments/services/list-doctors";
import { utcToCivilDate } from "@/features/scheduling/lib/timezone";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { generateAvailableSlots } from "@/features/scheduling/services/generate-available-slots";
import { listHolidays } from "@/features/scheduling/services/holidays";
import { listScheduleOverrides } from "@/features/scheduling/services/overrides";

export const metadata: Metadata = {
  title: "Scheduling",
};

/**
 * Admin Scheduling — configure clinic availability and preview dynamic slots.
 */
export default async function SchedulingPage() {
  const [settings, holidays, overrides, doctors] = await Promise.all([
    getOrCreateClinicSettings(),
    listHolidays(),
    listScheduleOverrides(),
    listBookableDoctors(),
  ]);

  const previewDate = utcToCivilDate(new Date(), settings.timezone);
  const previewResult = await generateAvailableSlots(previewDate);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Scheduling"
        description="Configure working hours, breaks, holidays, and date blocks. Available appointment times are generated dynamically — never stored as slot inventory."
      />

      <DefaultDoctorSettings
        doctors={doctors}
        currentDoctorId={
          settings.defaultDoctorId ? String(settings.defaultDoctorId) : null
        }
      />

      <SchedulingWorkspace
        availability={{
          timezone: settings.timezone,
          workingDays: settings.workingDays,
          openingTime: settings.openingTime,
          closingTime: settings.closingTime,
          appointmentDurationMinutes: settings.appointmentDurationMinutes,
          breaks: settings.breaks.map((item) => ({
            startTime: item.startTime,
            endTime: item.endTime,
            label: item.label,
          })),
        }}
        holidays={holidays}
        overrides={overrides}
        previewDate={previewDate}
        previewResult={previewResult}
      />
    </div>
  );
}
