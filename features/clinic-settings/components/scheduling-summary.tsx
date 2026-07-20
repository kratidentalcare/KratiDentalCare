import Link from "next/link";
import { ArrowRightIcon, CalendarClockIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { formatClinicWorkingHours } from "@/features/clinic-settings/lib/format-clinic";
import type { ClinicSettingsView } from "@/features/clinic-settings/types";

type SchedulingSummaryProps = {
  settings: ClinicSettingsView;
};

/**
 * Read-only scheduling snapshot — edits live on Dashboard → Scheduling
 * so there is a single admin interface for hours / breaks / holidays.
 */
export function SchedulingSummary({ settings }: SchedulingSummaryProps) {
  const hoursLabel = formatClinicWorkingHours({
    workingDays: settings.workingDays,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
  });

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <CalendarClockIcon className="size-4" />
        <AlertTitle>Managed in Scheduling</AlertTitle>
        <AlertDescription>
          Working days, hours, breaks, timezone, holidays, and date blocks are
          configured in one place. Changing them does not modify existing
          appointments — only future availability uses the new rules.
        </AlertDescription>
      </Alert>

      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Current schedule
          </CardTitle>
          <CardDescription>
            Snapshot from ClinicSettings (source of truth for the availability
            engine).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <span className="text-brand-muted">Working hours</span>
            <span className="font-medium text-brand-dark">{hoursLabel}</span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <span className="text-brand-muted">Timezone</span>
            <span className="font-medium text-brand-dark">
              {settings.timezone}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <span className="text-brand-muted">Appointment duration</span>
            <span className="font-medium text-brand-dark">
              {settings.appointmentDurationMinutes} minutes
            </span>
          </div>

          <div className="pt-2">
            <Button render={<Link href={ROUTES.DASHBOARD.SCHEDULING} />}>
              Open Scheduling
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
