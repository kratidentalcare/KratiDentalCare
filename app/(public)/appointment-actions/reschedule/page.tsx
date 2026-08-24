import type { Metadata } from "next";

import { AppointmentActionResult } from "@/app/(public)/appointment-actions/_components/appointment-action-result";
import { EmailRescheduleWorkspace } from "@/app/(public)/appointment-actions/_components/email-reschedule-workspace";
import { loadEmailReschedulePage } from "@/features/appointments/services/email-actions";

export const metadata: Metadata = {
  title: "Reschedule appointment",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ t?: string }>;
};

export default async function AppointmentEmailReschedulePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const loaded = await loadEmailReschedulePage(params.t ?? "");

  if (!loaded.ok) {
    return <AppointmentActionResult result={loaded.result} />;
  }

  return <EmailRescheduleWorkspace initial={loaded.data} />;
}
