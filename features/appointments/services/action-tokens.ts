import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import { Types } from "mongoose";

import {
  APPOINTMENT_EMAIL_ACTIONS,
  APPOINTMENT_EMAIL_ACTION_VALUES,
  DEFAULT_EMAIL_ACTION_TOKEN_TTL_HOURS,
  type AppointmentEmailAction,
} from "@/constants/email";
import { ROUTES } from "@/constants/routes";
import { hashActionToken } from "@/features/appointments/lib/action-token-hash";
import { getAppBaseUrlForEmail } from "@/features/email/lib/clinic-branding";
import { connect } from "@/lib/db";
import { DomainError, NotFoundError } from "@/lib/errors";
import {
  AppointmentActionToken,
  type LeanAppointmentActionToken,
} from "@/models/appointment-action-token";
import { Appointment, type LeanAppointment } from "@/models/appointment";

export { hashActionToken } from "@/features/appointments/lib/action-token-hash";

export type AdminActionTokenUrls = {
  approveUrl: string;
  cancelUrl: string;
  rescheduleUrl: string;
  bundleId: string;
  expiresAt: Date;
};

export type VerifiedActionToken = {
  token: LeanAppointmentActionToken;
  appointment: LeanAppointment;
  rawAction: AppointmentEmailAction;
};

function getTokenTtlHours(): number {
  const raw = process.env.EMAIL_ACTION_TOKEN_TTL_HOURS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_EMAIL_ACTION_TOKEN_TTL_HOURS;
}

function mintRawToken(): string {
  return randomBytes(32).toString("base64url");
}

function buildActionUrl(
  action: AppointmentEmailAction,
  rawToken: string,
): string {
  const base = getAppBaseUrlForEmail();
  const path =
    action === APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE
      ? ROUTES.APPOINTMENT_ACTIONS.RESCHEDULE
      : ROUTES.APPOINTMENT_ACTIONS.ROOT;
  const url = new URL(path, `${base}/`);
  url.searchParams.set("t", rawToken);
  if (action !== APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE) {
    url.searchParams.set("action", action);
  }
  return url.toString();
}

/**
 * Creates a bundle of approve / cancel / reschedule tokens for one admin email.
 */
export async function mintAdminActionTokenBundle(
  appointmentId: string,
): Promise<AdminActionTokenUrls> {
  await connect();

  const appointmentObjectId = new Types.ObjectId(appointmentId);
  const bundleId = randomUUID();
  const expiresAt = new Date(
    Date.now() + getTokenTtlHours() * 60 * 60 * 1000,
  );

  const minted: Array<{
    action: AppointmentEmailAction;
    raw: string;
  }> = APPOINTMENT_EMAIL_ACTION_VALUES.map((action) => ({
    action,
    raw: mintRawToken(),
  }));

  await AppointmentActionToken.insertMany(
    minted.map(({ action, raw }) => ({
      tokenHash: hashActionToken(raw),
      appointmentId: appointmentObjectId,
      action,
      bundleId,
      expiresAt,
      consumedAt: null,
      consumedByAction: null,
    })),
  );

  const byAction = Object.fromEntries(
    minted.map(({ action, raw }) => [action, raw]),
  ) as Record<AppointmentEmailAction, string>;

  return {
    approveUrl: buildActionUrl(
      APPOINTMENT_EMAIL_ACTIONS.APPROVE,
      byAction.approve,
    ),
    cancelUrl: buildActionUrl(
      APPOINTMENT_EMAIL_ACTIONS.CANCEL,
      byAction.cancel,
    ),
    rescheduleUrl: buildActionUrl(
      APPOINTMENT_EMAIL_ACTIONS.RESCHEDULE,
      byAction.reschedule,
    ),
    bundleId,
    expiresAt,
  };
}

export async function verifyActionToken(
  rawToken: string,
  expectedAction?: AppointmentEmailAction,
): Promise<VerifiedActionToken> {
  await connect();

  const trimmed = rawToken.trim();
  if (!trimmed) {
    throw new DomainError("INVALID_TOKEN", "This link is invalid or has expired.");
  }

  const token = await AppointmentActionToken.findOne({
    tokenHash: hashActionToken(trimmed),
  }).lean<LeanAppointmentActionToken>();

  if (!token) {
    throw new DomainError("INVALID_TOKEN", "This link is invalid or has expired.");
  }

  if (expectedAction && token.action !== expectedAction) {
    throw new DomainError(
      "WRONG_ACTION",
      "This link is invalid or has expired.",
    );
  }

  if (token.consumedAt != null) {
    throw new DomainError(
      "TOKEN_CONSUMED",
      "Appointment has already been processed.",
    );
  }

  if (token.expiresAt.getTime() <= Date.now()) {
    throw new DomainError(
      "TOKEN_EXPIRED",
      "This link is invalid or has expired.",
    );
  }

  const appointment = await Appointment.findOne({
    _id: token.appointmentId,
    deletedAt: null,
  }).lean<LeanAppointment>();

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  return {
    token,
    appointment,
    rawAction: token.action,
  };
}

/**
 * Marks every token in the bundle as consumed after a successful lifecycle action.
 */
export async function consumeTokenBundle(
  bundleId: string,
  consumedByAction: AppointmentEmailAction,
): Promise<void> {
  await connect();
  const now = new Date();

  await AppointmentActionToken.updateMany(
    {
      bundleId,
      consumedAt: null,
    },
    {
      $set: {
        consumedAt: now,
        consumedByAction,
      },
    },
  );
}
