import type { ClinicEmailBranding } from "@/features/email/lib/branding-types";
import {
  appointmentSummaryRows,
  dangerButton,
  renderEmailLayout,
  successButton,
  summaryToText,
  warningButton,
  type AppointmentEmailSummary,
  type EmailDocument,
} from "@/features/email/templates/layout";

export type AdminNewAppointmentTemplateInput = {
  branding: ClinicEmailBranding;
  summary: AppointmentEmailSummary;
  approveUrl: string;
  cancelUrl: string;
  rescheduleUrl: string;
};

export function buildAdminNewAppointmentEmail(
  input: AdminNewAppointmentTemplateInput,
): EmailDocument {
  const heading = `New Appointment Request — ${input.summary.patientName}`;
  const message =
    "A patient has requested an appointment and is waiting for your approval.";
  const rows = appointmentSummaryRows(input.summary, {
    includePatientContact: true,
  });

  const actionsHtml = [
    successButton(input.approveUrl, "✓ Approve Appointment"),
    dangerButton(input.cancelUrl, "✕ Cancel Appointment"),
    warningButton(input.rescheduleUrl, "↻ Reschedule Appointment"),
  ].join("");

  return {
    subject: heading,
    html: renderEmailLayout({
      branding: input.branding,
      heading: "New Appointment Request",
      message,
      summaryRows: rows,
      actionsHtml,
      footerNote:
        "These action links expire and can only be used while the appointment is still pending.",
    }),
    text: summaryToText(heading, message, rows, input.branding, [
      `Approve: ${input.approveUrl}`,
      `Cancel: ${input.cancelUrl}`,
      `Reschedule: ${input.rescheduleUrl}`,
    ]),
  };
}
