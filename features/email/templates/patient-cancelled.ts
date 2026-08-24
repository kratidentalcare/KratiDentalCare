import type { ClinicEmailBranding } from "@/features/email/lib/branding-types";
import {
  appointmentSummaryRows,
  primaryButton,
  renderEmailLayout,
  summaryToText,
  type AppointmentEmailSummary,
  type EmailDocument,
} from "@/features/email/templates/layout";

export type PatientCancelledTemplateInput = {
  branding: ClinicEmailBranding;
  summary: AppointmentEmailSummary;
};

export function buildPatientCancelledEmail(
  input: PatientCancelledTemplateInput,
): EmailDocument {
  const heading = `Appointment Cancelled — ${input.branding.clinicName}`;
  const message =
    "Your appointment has been cancelled. Please contact the clinic if you would like to book a new time.";
  const rows = [
    ...appointmentSummaryRows(input.summary),
    { label: "Clinic phone", value: input.branding.phone },
    { label: "Clinic email", value: input.branding.email },
  ];

  return {
    subject: heading,
    html: renderEmailLayout({
      branding: input.branding,
      heading: "Appointment Cancelled",
      message,
      summaryRows: rows,
      actionsHtml: primaryButton(input.branding.contactUrl, "Contact Clinic"),
    }),
    text: summaryToText(heading, message, rows, input.branding, [
      `Contact clinic: ${input.branding.contactUrl}`,
    ]),
  };
}
