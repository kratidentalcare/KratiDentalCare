import type { ClinicEmailBranding } from "@/features/email/lib/branding-types";
import {
  appointmentSummaryRows,
  primaryButton,
  renderEmailLayout,
  summaryToText,
  type AppointmentEmailSummary,
  type EmailDocument,
} from "@/features/email/templates/layout";

export type PatientRescheduledTemplateInput = {
  branding: ClinicEmailBranding;
  summary: AppointmentEmailSummary;
};

export function buildPatientRescheduledEmail(
  input: PatientRescheduledTemplateInput,
): EmailDocument {
  const heading = `Appointment Rescheduled — ${input.branding.clinicName}`;
  const message = "Your appointment has been rescheduled.";
  const rows = [
    ...appointmentSummaryRows(input.summary),
    { label: "Clinic address", value: input.branding.address },
  ];

  const actionsHtml = [
    primaryButton(input.branding.bookUrl, "View Appointment"),
    primaryButton(input.branding.contactUrl, "Contact Clinic"),
  ].join("");

  return {
    subject: heading,
    html: renderEmailLayout({
      branding: input.branding,
      heading: "Appointment Rescheduled",
      message,
      summaryRows: rows,
      actionsHtml,
    }),
    text: summaryToText(heading, message, rows, input.branding, [
      `View / contact: ${input.branding.contactUrl}`,
    ]),
  };
}
