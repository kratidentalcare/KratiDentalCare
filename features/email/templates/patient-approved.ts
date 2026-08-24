import type { ClinicEmailBranding } from "@/features/email/lib/branding-types";
import {
  appointmentSummaryRows,
  primaryButton,
  renderEmailLayout,
  summaryToText,
  type AppointmentEmailSummary,
  type EmailDocument,
} from "@/features/email/templates/layout";

export type PatientApprovedTemplateInput = {
  branding: ClinicEmailBranding;
  summary: AppointmentEmailSummary;
};

export function buildPatientApprovedEmail(
  input: PatientApprovedTemplateInput,
): EmailDocument {
  const heading = `Appointment Confirmed — ${input.branding.clinicName}`;
  const message =
    "Your appointment has been confirmed. Please be ready a few minutes before your scheduled time.";
  const rows = [
    ...appointmentSummaryRows(input.summary),
    { label: "Clinic address", value: input.branding.address },
    { label: "Clinic phone", value: input.branding.phone },
  ];

  const actionsHtml = [
    primaryButton(input.branding.contactUrl, "Contact Clinic"),
    primaryButton(input.branding.bookUrl, "View Appointment"),
  ].join("");

  return {
    subject: heading,
    html: renderEmailLayout({
      branding: input.branding,
      heading: "Appointment Confirmed",
      message,
      summaryRows: rows,
      actionsHtml,
    }),
    text: summaryToText(heading, message, rows, input.branding, [
      `Contact clinic: ${input.branding.contactUrl}`,
    ]),
  };
}
