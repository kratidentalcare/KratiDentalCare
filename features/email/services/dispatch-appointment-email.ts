import "server-only";

import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUSES,
  type AppointmentEventType,
} from "@/constants/appointments";
import { EMAIL_TYPES, type EmailType } from "@/constants/email";
import { formatSlotLabel } from "@/features/appointments/lib/format";
import { mintAdminActionTokenBundle } from "@/features/appointments/services/action-tokens";
import {
  getClinicEmailBranding,
} from "@/features/email/lib/clinic-branding";
import type { ClinicEmailBranding } from "@/features/email/lib/branding-types";
import { mapEventToEmailType } from "@/features/email/lib/map-email-type";
import { sendEmail } from "@/features/email/services/send-email";
import {
  buildAdminNewAppointmentEmail,
  buildPatientApprovedEmail,
  buildPatientCancelledEmail,
  buildPatientRescheduledEmail,
  type AppointmentEmailSummary,
} from "@/features/email/templates";
import { connect } from "@/lib/db";
import type { LeanAppointment } from "@/models/appointment";
import {
  NotificationOutbox,
  type LeanNotificationOutbox,
} from "@/models/notification-outbox";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";

export { mapEventToEmailType } from "@/features/email/lib/map-email-type";

function formatDateLabel(instant: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(instant);
}

function formatBookedAtLabel(instant: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instant);
}

function buildSummary(
  appointment: LeanAppointment,
  timezone: string,
  statusLabel: string,
  extras?: Partial<AppointmentEmailSummary>,
): AppointmentEmailSummary {
  return {
    patientName: appointment.patientSnapshot.fullName,
    patientPhone: appointment.patientSnapshot.phone,
    patientEmail: appointment.patientSnapshot.email,
    doctorName: appointment.doctorSnapshot.fullName,
    dateLabel: formatDateLabel(appointment.startsAt, timezone),
    timeLabel: formatSlotLabel(appointment.startsAt, timezone),
    appointmentId: String(appointment._id),
    statusLabel,
    bookedAtLabel: formatBookedAtLabel(
      appointment.createdAt instanceof Date
        ? appointment.createdAt
        : appointment.startsAt,
      timezone,
    ),
    ...extras,
  };
}

async function markOutboxFailed(
  outboxId: LeanNotificationOutbox["_id"],
  error: string,
  extras?: {
    recipient?: string | null;
    emailType?: EmailType | null;
  },
): Promise<void> {
  await NotificationOutbox.updateOne(
    { _id: outboxId },
    {
      $set: {
        status: NOTIFICATION_STATUSES.FAILED,
        lastError: error.slice(0, 1000),
        ...(extras?.recipient !== undefined
          ? { recipient: extras.recipient }
          : {}),
        ...(extras?.emailType !== undefined
          ? { emailType: extras.emailType }
          : {}),
      },
    },
  );
}

async function markOutboxSent(
  outboxId: LeanNotificationOutbox["_id"],
  input: {
    recipient: string;
    emailType: EmailType;
    providerMessageId: string | null;
  },
): Promise<void> {
  await NotificationOutbox.updateOne(
    { _id: outboxId },
    {
      $set: {
        status: NOTIFICATION_STATUSES.SENT,
        sentAt: new Date(),
        lastError: null,
        recipient: input.recipient,
        emailType: input.emailType,
        providerMessageId: input.providerMessageId,
      },
    },
  );
}

async function buildEmailDocument(
  appointment: LeanAppointment,
  emailType: EmailType,
  branding: ClinicEmailBranding,
  timezone: string,
) {
  switch (emailType) {
    case EMAIL_TYPES.ADMIN_NEW_APPOINTMENT: {
      const urls = await mintAdminActionTokenBundle(String(appointment._id));
      const summary = buildSummary(
        appointment,
        timezone,
        "Pending Approval",
      );
      return buildAdminNewAppointmentEmail({
        branding,
        summary,
        approveUrl: urls.approveUrl,
        cancelUrl: urls.cancelUrl,
        rescheduleUrl: urls.rescheduleUrl,
      });
    }
    case EMAIL_TYPES.PATIENT_APPROVED: {
      const summary = buildSummary(appointment, timezone, "CONFIRMED");
      return buildPatientApprovedEmail({ branding, summary });
    }
    case EMAIL_TYPES.PATIENT_CANCELLED: {
      const summary = buildSummary(appointment, timezone, "CANCELLED", {
        cancellationReason: appointment.cancellationReason,
      });
      return buildPatientCancelledEmail({ branding, summary });
    }
    case EMAIL_TYPES.PATIENT_RESCHEDULED: {
      const previousStartsAt = appointment.rescheduledFromStartsAt;
      const summary = buildSummary(appointment, timezone, "RESCHEDULED", {
        previousDateLabel: previousStartsAt
          ? formatDateLabel(previousStartsAt, timezone)
          : undefined,
        previousTimeLabel: previousStartsAt
          ? formatSlotLabel(previousStartsAt, timezone)
          : undefined,
      });
      return buildPatientRescheduledEmail({ branding, summary });
    }
    default: {
      const exhaustive: never = emailType;
      void exhaustive;
      return null;
    }
  }
}

/**
 * Claims and sends one EMAIL outbox row for an appointment lifecycle event.
 * Idempotent: a second claim on the same key is a no-op.
 */
export async function dispatchAppointmentEmail(
  appointment: LeanAppointment,
  eventType: AppointmentEventType,
): Promise<void> {
  const emailType = mapEventToEmailType(eventType);
  if (!emailType) {
    return;
  }

  await connect();

  const appointmentId = String(appointment._id);
  const idempotencyKey = `${appointmentId}:${eventType}:${NOTIFICATION_CHANNELS.EMAIL}`;

  const claimed = await NotificationOutbox.findOneAndUpdate(
    {
      idempotencyKey,
      channel: NOTIFICATION_CHANNELS.EMAIL,
      status: NOTIFICATION_STATUSES.PENDING,
    },
    {
      $set: {
        status: NOTIFICATION_STATUSES.SENDING,
        emailType,
        lastError: null,
      },
    },
    { new: true },
  ).lean<LeanNotificationOutbox>();

  if (!claimed) {
    return;
  }

  try {
    const branding = await getClinicEmailBranding();
    const settings = await getOrCreateClinicSettings();
    const timezone = settings.timezone;

    const recipient =
      emailType === EMAIL_TYPES.ADMIN_NEW_APPOINTMENT
        ? branding.email
        : appointment.patientSnapshot.email?.trim() || null;

    if (!recipient) {
      await markOutboxFailed(
        claimed._id,
        emailType === EMAIL_TYPES.ADMIN_NEW_APPOINTMENT
          ? "Clinic email is not configured"
          : "Patient email is missing",
        { recipient: null, emailType },
      );
      return;
    }

    const document = await buildEmailDocument(
      appointment,
      emailType,
      branding,
      timezone,
    );

    if (!document) {
      await markOutboxFailed(claimed._id, "Unsupported email type", {
        recipient,
        emailType,
      });
      return;
    }

    const result = await sendEmail({
      to: recipient,
      subject: document.subject,
      html: document.html,
      text: document.text,
      tags: [emailType, eventType],
    });

    if (!result.ok) {
      await markOutboxFailed(
        claimed._id,
        result.error ?? "Email provider failed",
        { recipient, emailType },
      );
      return;
    }

    await markOutboxSent(claimed._id, {
      recipient,
      emailType,
      providerMessageId: result.messageId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Email dispatch failed";
    console.error("[email] dispatchAppointmentEmail failed", {
      appointmentId,
      eventType,
      message,
    });
    await markOutboxFailed(claimed._id, message, { emailType });
  }
}

/**
 * Best-effort wrapper — never throws into appointment lifecycle callers.
 */
export async function bestEffortDispatchAppointmentEmail(
  appointment: LeanAppointment,
  eventType: AppointmentEventType,
): Promise<void> {
  try {
    await dispatchAppointmentEmail(appointment, eventType);
  } catch (error) {
    console.error("[email] bestEffortDispatchAppointmentEmail failed", {
      appointmentId: String(appointment._id),
      eventType,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
