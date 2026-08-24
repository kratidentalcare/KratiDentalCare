import "server-only";

import {
  APPOINTMENT_EMAIL_ACTIONS,
  DEFAULT_EMAIL_CANCEL_REASON,
  type AppointmentEmailAction,
} from "@/constants/email";
import { USER_ROLES } from "@/constants/roles";
import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import {
  canRescheduleAppointment,
} from "@/features/appointments/lib/lifecycle";
import { formatSlotLabel } from "@/features/appointments/lib/format";
import {
  consumeTokenBundle,
  verifyActionToken,
} from "@/features/appointments/services/action-tokens";
import {
  getRescheduleAvailability,
  performAppointmentAction,
} from "@/features/appointments/services/lifecycle-actions";
import type { BookingAvailabilityResult } from "@/features/appointments/types";
import { connect } from "@/lib/db";
import { DomainError, isAppError } from "@/lib/errors";
import { User, type LeanUser } from "@/models/user";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";

const EMAIL_AUDIT_META = { source: "EMAIL_TOKEN" } as const;

export type EmailActionResultKind =
  | "success"
  | "already_processed"
  | "invalid_link"
  | "error";

export type EmailActionResultView = {
  kind: EmailActionResultKind;
  title: string;
  message: string;
  action?: AppointmentEmailAction;
};

export type EmailReschedulePageData = {
  token: string;
  patientName: string;
  doctorName: string;
  dateLabel: string;
  timeLabel: string;
  status: string;
  appointmentId: string;
};

function formatDateLabel(instant: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(instant);
}

function isAlreadyProcessedError(error: unknown): boolean {
  if (!isAppError(error)) {
    return false;
  }
  return (
    error.code === "INVALID_TRANSITION" ||
    error.code === "TOKEN_CONSUMED" ||
    error.message.toLowerCase().includes("already been processed")
  );
}

function isInvalidLinkError(error: unknown): boolean {
  if (!isAppError(error)) {
    return false;
  }
  return (
    error.code === "INVALID_TOKEN" ||
    error.code === "TOKEN_EXPIRED" ||
    error.code === "WRONG_ACTION"
  );
}

function alreadyProcessedResult(
  action?: AppointmentEmailAction,
): EmailActionResultView {
  return {
    kind: "already_processed",
    title: "Appointment has already been processed.",
    message:
      "This appointment is no longer waiting for approval, or the email link was already used.",
    action,
  };
}

function invalidLinkResult(): EmailActionResultView {
  return {
    kind: "invalid_link",
    title: "This link is invalid or has expired.",
    message:
      "Request a new notification from the clinic dashboard, or manage the appointment there directly.",
  };
}

function mapErrorToResult(error: unknown): EmailActionResultView {
  if (isInvalidLinkError(error)) {
    return invalidLinkResult();
  }
  if (isAlreadyProcessedError(error)) {
    return alreadyProcessedResult();
  }
  const message =
    error instanceof Error
      ? error.message
      : "Something went wrong while processing this action.";
  return {
    kind: "error",
    title: "Unable to process this action",
    message,
  };
}

/**
 * Resolves an active admin/staff user to attribute email-link lifecycle actions.
 */
export async function resolveEmailActionActorUserId(): Promise<string> {
  await connect();

  const actor = await User.findOne({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.STAFF] },
    isActive: true,
    deletedAt: null,
  })
    .sort({ role: 1, createdAt: 1 })
    .lean<LeanUser>();

  if (!actor) {
    throw new DomainError(
      "EMAIL_ACTION_ACTOR_MISSING",
      "No active admin or staff user is available to attribute this email action.",
    );
  }

  return String(actor._id);
}

async function consumeBundleQuietly(
  bundleId: string,
  action: AppointmentEmailAction,
): Promise<void> {
  try {
    await consumeTokenBundle(bundleId, action);
  } catch (error) {
    console.error("[email-actions] failed to consume token bundle", {
      bundleId,
      action,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function executeEmailApproveAction(
  rawToken: string,
): Promise<EmailActionResultView> {
  try {
    const verified = await verifyActionToken(
      rawToken,
      APPOINTMENT_EMAIL_ACTIONS.APPROVE,
    );

    if (verified.appointment.status !== APPOINTMENT_STATUSES.PENDING) {
      await consumeBundleQuietly(
        verified.token.bundleId,
        APPOINTMENT_EMAIL_ACTIONS.APPROVE,
      );
      return alreadyProcessedResult(APPOINTMENT_EMAIL_ACTIONS.APPROVE);
    }

    const actorUserId = await resolveEmailActionActorUserId();
    await performAppointmentAction(
      String(verified.appointment._id),
      { action: "approve" },
      actorUserId,
      { auditMeta: EMAIL_AUDIT_META },
    );
    await consumeTokenBundle(
      verified.token.bundleId,
      APPOINTMENT_EMAIL_ACTIONS.APPROVE,
    );

    return {
      kind: "success",
      title: "Appointment confirmed",
      message:
        "Appointment confirmed. The patient has been notified.",
      action: APPOINTMENT_EMAIL_ACTIONS.APPROVE,
    };
  } catch (error) {
    return mapErrorToResult(error);
  }
}

export async function executeEmailCancelAction(
  rawToken: string,
  cancellationReason?: string,
): Promise<EmailActionResultView> {
  try {
    const verified = await verifyActionToken(
      rawToken,
      APPOINTMENT_EMAIL_ACTIONS.CANCEL,
    );

    if (verified.appointment.status !== APPOINTMENT_STATUSES.PENDING) {
      await consumeBundleQuietly(
        verified.token.bundleId,
        APPOINTMENT_EMAIL_ACTIONS.CANCEL,
      );
      return alreadyProcessedResult(APPOINTMENT_EMAIL_ACTIONS.CANCEL);
    }

    const reason =
      cancellationReason?.trim() && cancellationReason.trim().length >= 3
        ? cancellationReason.trim()
        : DEFAULT_EMAIL_CANCEL_REASON;

    const actorUserId = await resolveEmailActionActorUserId();
    await performAppointmentAction(
      String(verified.appointment._id),
      { action: "cancel", cancellationReason: reason },
      actorUserId,
      { auditMeta: EMAIL_AUDIT_META },
    );
    await consumeTokenBundle(
      verified.token.bundleId,
      APPOINTMENT_EMAIL_ACTIONS.CANCEL,
    );

    return {
      kind: "success",
      title: "Appointment cancelled",
      message:
        "Appointment cancelled. The patient has been notified.",
      action: APPOINTMENT_EMAIL_ACTIONS.CANCEL,
    };
  } catch (error) {
    return mapErrorToResult(error);
  }
}

export async function loadEmailReschedulePage(
  rawToken: string,
): Promise<
  | { ok: true; data: EmailReschedulePageData }
  | { ok: false; result: EmailActionResultView }
> {
  try {
    const verified = await verifyActionToken(
      rawToken,
      APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE,
    );

    if (
      !canRescheduleAppointment(
        verified.appointment.status,
        verified.appointment.startsAt,
      )
    ) {
      await consumeBundleQuietly(
        verified.token.bundleId,
        APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE,
      );
      return { ok: false, result: alreadyProcessedResult("reschedule") };
    }

    const settings = await getOrCreateClinicSettings();
    const timezone = settings.timezone;

    return {
      ok: true,
      data: {
        token: rawToken.trim(),
        patientName: verified.appointment.patientSnapshot.fullName,
        doctorName: verified.appointment.doctorSnapshot.fullName,
        dateLabel: formatDateLabel(
          verified.appointment.startsAt,
          timezone,
        ),
        timeLabel: formatSlotLabel(
          verified.appointment.startsAt,
          timezone,
        ),
        status: verified.appointment.status,
        appointmentId: String(verified.appointment._id),
      },
    };
  } catch (error) {
    return { ok: false, result: mapErrorToResult(error) };
  }
}

export async function getEmailRescheduleAvailability(
  rawToken: string,
  date: string,
): Promise<BookingAvailabilityResult> {
  const verified = await verifyActionToken(
    rawToken,
    APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE,
  );

  if (
    !canRescheduleAppointment(
      verified.appointment.status,
      verified.appointment.startsAt,
    )
  ) {
    throw new DomainError(
      "INVALID_TRANSITION",
      "Appointment has already been processed.",
    );
  }

  return getRescheduleAvailability(
    String(verified.appointment._id),
    date,
  );
}

export async function executeEmailRescheduleAction(
  rawToken: string,
  input: { date: string; startAt: string; endAt: string },
): Promise<EmailActionResultView> {
  try {
    const verified = await verifyActionToken(
      rawToken,
      APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE,
    );

    if (
      !canRescheduleAppointment(
        verified.appointment.status,
        verified.appointment.startsAt,
      )
    ) {
      await consumeBundleQuietly(
        verified.token.bundleId,
        APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE,
      );
      return alreadyProcessedResult("reschedule");
    }

    const actorUserId = await resolveEmailActionActorUserId();
    await performAppointmentAction(
      String(verified.appointment._id),
      {
        action: "reschedule",
        date: input.date,
        startAt: input.startAt,
        endAt: input.endAt,
      },
      actorUserId,
      { auditMeta: EMAIL_AUDIT_META },
    );
    await consumeTokenBundle(
      verified.token.bundleId,
      APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE,
    );

    return {
      kind: "success",
      title: "Appointment rescheduled",
      message:
        "Appointment rescheduled. The patient has been notified.",
      action: APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE,
    };
  } catch (error) {
    return mapErrorToResult(error);
  }
}

export { previewEmailActionPage } from "@/features/appointments/lib/email-action-preview";
