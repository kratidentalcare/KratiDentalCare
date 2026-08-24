import type { Metadata } from "next";

import { AppointmentActionResult } from "@/app/(public)/appointment-actions/_components/appointment-action-result";
import { CancelConfirmForm } from "@/app/(public)/appointment-actions/_components/cancel-confirm-form";
import { APPOINTMENT_EMAIL_ACTIONS } from "@/constants/email";
import {
  executeEmailApproveAction,
  previewEmailActionPage,
} from "@/features/appointments/services/email-actions";

export const metadata: Metadata = {
  title: "Appointment action",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ t?: string; action?: string }>;
};

export default async function AppointmentActionsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const preview = previewEmailActionPage(params.t, params.action);

  if (preview.mode === "invalid") {
    return (
      <AppointmentActionResult
        result={{
          kind: "invalid_link",
          title: "This link is invalid or has expired.",
          message:
            "Request a new notification from the clinic dashboard, or manage the appointment there directly.",
        }}
      />
    );
  }

  if (preview.mode === "cancel_confirm") {
    return <CancelConfirmForm token={preview.token} />;
  }

  if (params.action && params.action !== APPOINTMENT_EMAIL_ACTIONS.APPROVE) {
    return (
      <AppointmentActionResult
        result={{
          kind: "invalid_link",
          title: "This link is invalid or has expired.",
          message:
            "Request a new notification from the clinic dashboard, or manage the appointment there directly.",
        }}
      />
    );
  }

  const result = await executeEmailApproveAction(preview.token);
  return <AppointmentActionResult result={result} />;
}
