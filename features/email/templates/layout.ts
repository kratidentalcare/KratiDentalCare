import type { ClinicEmailBranding } from "@/features/email/lib/branding-types";

export type EmailDocument = {
  subject: string;
  html: string;
  text: string;
};

export type AppointmentEmailSummary = {
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorName: string;
  dateLabel: string;
  timeLabel: string;
  appointmentId: string;
  statusLabel: string;
  bookedAtLabel?: string;
  previousDateLabel?: string;
  previousTimeLabel?: string;
  cancellationReason?: string | null;
};

type LayoutInput = {
  branding: ClinicEmailBranding;
  heading: string;
  message: string;
  summaryRows: Array<{ label: string; value: string }>;
  actionsHtml?: string;
  footerNote?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function button(
  href: string,
  label: string,
  background: string,
): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 18px;margin:4px 6px 4px 0;background:${background};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;line-height:1.2;">${escapeHtml(label)}</a>`;
}

export function primaryButton(href: string, label: string): string {
  return button(href, label, "#0f766e");
}

export function successButton(href: string, label: string): string {
  return button(href, label, "#15803d");
}

export function dangerButton(href: string, label: string): string {
  return button(href, label, "#b91c1c");
}

export function warningButton(href: string, label: string): string {
  return button(href, label, "#b45309");
}

function summaryTable(
  rows: Array<{ label: string; value: string }>,
): string {
  const body = rows
    .map(
      (row) => `<tr>
  <td style="padding:8px 0;color:#64748b;font-size:13px;width:40%;vertical-align:top;">${escapeHtml(row.label)}</td>
  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(row.value)}</td>
</tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${body}</table>`;
}

function socialLinksHtml(branding: ClinicEmailBranding): string {
  const links = [
    branding.socialLinks.facebook
      ? `<a href="${escapeHtml(branding.socialLinks.facebook)}" style="color:#64748b;text-decoration:underline;margin-right:10px;">Facebook</a>`
      : null,
    branding.socialLinks.instagram
      ? `<a href="${escapeHtml(branding.socialLinks.instagram)}" style="color:#64748b;text-decoration:underline;margin-right:10px;">Instagram</a>`
      : null,
    branding.socialLinks.twitter
      ? `<a href="${escapeHtml(branding.socialLinks.twitter)}" style="color:#64748b;text-decoration:underline;margin-right:10px;">Twitter</a>`
      : null,
    branding.socialLinks.youtube
      ? `<a href="${escapeHtml(branding.socialLinks.youtube)}" style="color:#64748b;text-decoration:underline;">YouTube</a>`
      : null,
  ].filter(Boolean);

  if (links.length === 0) {
    return "";
  }

  return `<p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">${links.join("")}</p>`;
}

export function renderEmailLayout(input: LayoutInput): string {
  const { branding, heading, message, summaryRows, actionsHtml, footerNote } =
    input;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="padding:28px 28px 12px;text-align:center;background:linear-gradient(180deg,#ecfeff 0%,#ffffff 100%);">
              <img src="${escapeHtml(branding.logoUrl)}" alt="${escapeHtml(branding.clinicName)}" width="140" style="display:block;margin:0 auto 16px;max-width:140px;height:auto;" />
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#0f172a;">${escapeHtml(heading)}</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#475569;">${escapeHtml(message)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    ${summaryTable(summaryRows)}
                  </td>
                </tr>
              </table>
              ${
                actionsHtml
                  ? `<div style="margin-top:24px;text-align:center;">${actionsHtml}</div>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;border-top:1px solid #e2e8f0;">
              <p style="margin:20px 0 4px;font-size:14px;font-weight:600;color:#0f172a;">${escapeHtml(branding.clinicName)}</p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#64748b;">${escapeHtml(branding.address)}</p>
              <p style="margin:8px 0 0;font-size:13px;color:#64748b;">
                ${escapeHtml(branding.phone)} · <a href="mailto:${escapeHtml(branding.email)}" style="color:#0f766e;text-decoration:none;">${escapeHtml(branding.email)}</a>
              </p>
              <p style="margin:8px 0 0;font-size:13px;">
                <a href="${escapeHtml(branding.websiteUrl)}" style="color:#0f766e;text-decoration:none;">${escapeHtml(branding.websiteUrl)}</a>
              </p>
              ${socialLinksHtml(branding)}
              ${
                footerNote
                  ? `<p style="margin:16px 0 0;font-size:11px;color:#94a3b8;">${escapeHtml(footerNote)}</p>`
                  : ""
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function summaryToText(
  heading: string,
  message: string,
  rows: Array<{ label: string; value: string }>,
  branding: ClinicEmailBranding,
  ctaLines: string[] = [],
): string {
  const lines = [
    branding.clinicName,
    "",
    heading,
    message,
    "",
    ...rows.map((row) => `${row.label}: ${row.value}`),
    "",
    ...ctaLines,
    "",
    branding.address,
    branding.phone,
    branding.email,
    branding.websiteUrl,
  ];
  return lines.filter((line) => line !== undefined).join("\n");
}

export function appointmentSummaryRows(
  summary: AppointmentEmailSummary,
  options?: { includePatientContact?: boolean },
): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Patient", value: summary.patientName },
  ];

  if (options?.includePatientContact) {
    if (summary.patientPhone) {
      rows.push({ label: "Phone", value: summary.patientPhone });
    }
    if (summary.patientEmail) {
      rows.push({ label: "Email", value: summary.patientEmail });
    }
  }

  if (summary.previousDateLabel && summary.previousTimeLabel) {
    rows.push({
      label: "Previous date",
      value: summary.previousDateLabel,
    });
    rows.push({
      label: "Previous time",
      value: summary.previousTimeLabel,
    });
    rows.push({ label: "New date", value: summary.dateLabel });
    rows.push({ label: "New time", value: summary.timeLabel });
  } else {
    rows.push({ label: "Date", value: summary.dateLabel });
    rows.push({ label: "Time", value: summary.timeLabel });
  }

  rows.push({ label: "Doctor", value: summary.doctorName });
  rows.push({ label: "Appointment ID", value: summary.appointmentId });

  if (summary.bookedAtLabel) {
    rows.push({ label: "Booked at", value: summary.bookedAtLabel });
  }

  if (summary.cancellationReason) {
    rows.push({ label: "Reason", value: summary.cancellationReason });
  }

  rows.push({ label: "Status", value: summary.statusLabel });
  return rows;
}
