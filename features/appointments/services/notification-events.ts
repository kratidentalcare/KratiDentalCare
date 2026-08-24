import "server-only";

import {
  APPOINTMENT_EVENT_TYPES,
  BOOKING_SOURCES,
  NOTIFICATION_CHANNELS,
} from "@/constants/appointments";
import {
  notifyAppointmentCancelled,
  notifyAppointmentCompleted,
  notifyNewAppointment,
} from "@/features/notifications/services/emitters";
import { bestEffortDispatchAppointmentEmail } from "@/features/email/services/dispatch-appointment-email";
import { connect } from "@/lib/db";
import { AppointmentEvent } from "@/models/appointment-event";
import { NotificationOutbox } from "@/models/notification-outbox";
import type { LeanAppointment } from "@/models/appointment";
import { Types } from "mongoose";

type NotificationPayload = {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorName: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  status: string;
};

function buildNotificationPayload(
  appointment: LeanAppointment,
): NotificationPayload {
  return {
    patientName: appointment.patientSnapshot.fullName,
    patientPhone: appointment.patientSnapshot.phone,
    patientEmail: appointment.patientSnapshot.email,
    doctorName: appointment.doctorSnapshot.fullName,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    reason: appointment.reason,
    status: appointment.status,
  };
}

export async function recordAppointmentEvent(input: {
  appointmentId: string;
  eventType: (typeof APPOINTMENT_EVENT_TYPES)[keyof typeof APPOINTMENT_EVENT_TYPES];
  actorUserId?: string | null;
  payload?: Record<string, unknown> | null;
}): Promise<void> {
  await connect();

  await AppointmentEvent.create({
    appointmentId: new Types.ObjectId(input.appointmentId),
    eventType: input.eventType,
    actorUserId: input.actorUserId
      ? new Types.ObjectId(input.actorUserId)
      : null,
    payload: input.payload ?? null,
  });
}

/**
 * Enqueue provider-neutral notification intents for outbound delivery.
 */
export async function enqueueAppointmentNotifications(
  appointment: LeanAppointment,
  eventType: (typeof APPOINTMENT_EVENT_TYPES)[keyof typeof APPOINTMENT_EVENT_TYPES],
): Promise<void> {
  await connect();

  const payload = buildNotificationPayload(appointment);
  const appointmentId = String(appointment._id);

  const channels = [
    NOTIFICATION_CHANNELS.EMAIL,
    NOTIFICATION_CHANNELS.WHATSAPP,
  ] as const;

  const docs = channels.map((channel) => ({
    appointmentId: appointment._id,
    channel,
    eventType,
    idempotencyKey: `${appointmentId}:${eventType}:${channel}`,
    payload,
  }));

  try {
    await NotificationOutbox.insertMany(docs, { ordered: false });
  } catch (error) {
    // Duplicate idempotency keys on retries are safe to ignore.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return;
    }
    throw error;
  }
}

async function enqueueAndDispatch(
  appointment: LeanAppointment,
  eventType: (typeof APPOINTMENT_EVENT_TYPES)[keyof typeof APPOINTMENT_EVENT_TYPES],
): Promise<void> {
  try {
    await enqueueAppointmentNotifications(appointment, eventType);
  } catch (error) {
    console.error("[notifications] enqueue failed", {
      appointmentId: String(appointment._id),
      eventType,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Fire-and-forget so booking / lifecycle mutations are never blocked on SMTP/API latency.
  void bestEffortDispatchAppointmentEmail(appointment, eventType);
}

export async function onAppointmentCreated(
  appointment: LeanAppointment,
): Promise<void> {
  await recordAppointmentEvent({
    appointmentId: String(appointment._id),
    eventType: APPOINTMENT_EVENT_TYPES.CREATED,
    payload: {
      bookingSource: appointment.bookingSource ?? BOOKING_SOURCES.PUBLIC,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
    },
  });

  await enqueueAndDispatch(appointment, APPOINTMENT_EVENT_TYPES.CREATED);
  await notifyNewAppointment(appointment);
}

export async function onAppointmentConfirmed(
  appointment: LeanAppointment,
  actorUserId: string,
  auditMeta?: Record<string, unknown> | null,
): Promise<void> {
  await recordAppointmentEvent({
    appointmentId: String(appointment._id),
    eventType: APPOINTMENT_EVENT_TYPES.CONFIRMED,
    actorUserId,
    payload: {
      status: appointment.status,
      ...(auditMeta ?? {}),
    },
  });
  await enqueueAndDispatch(appointment, APPOINTMENT_EVENT_TYPES.CONFIRMED);
}

export async function onAppointmentCancelled(
  appointment: LeanAppointment,
  actorUserId: string,
  cancellationReason: string,
  auditMeta?: Record<string, unknown> | null,
): Promise<void> {
  await recordAppointmentEvent({
    appointmentId: String(appointment._id),
    eventType: APPOINTMENT_EVENT_TYPES.CANCELLED,
    actorUserId,
    payload: {
      cancellationReason,
      ...(auditMeta ?? {}),
    },
  });
  await enqueueAndDispatch(appointment, APPOINTMENT_EVENT_TYPES.CANCELLED);

  await notifyAppointmentCancelled(appointment, cancellationReason);
}

export async function onAppointmentCompleted(
  appointment: LeanAppointment,
  actorUserId: string,
): Promise<void> {
  await recordAppointmentEvent({
    appointmentId: String(appointment._id),
    eventType: APPOINTMENT_EVENT_TYPES.COMPLETED,
    actorUserId,
    payload: { status: appointment.status },
  });
  await enqueueAndDispatch(appointment, APPOINTMENT_EVENT_TYPES.COMPLETED);

  await notifyAppointmentCompleted(appointment);
}

export async function onAppointmentRescheduled(
  appointment: LeanAppointment,
  actorUserId: string,
  previous: { startsAt: Date; endsAt: Date },
  auditMeta?: Record<string, unknown> | null,
): Promise<void> {
  await recordAppointmentEvent({
    appointmentId: String(appointment._id),
    eventType: APPOINTMENT_EVENT_TYPES.RESCHEDULED,
    actorUserId,
    payload: {
      previousStartsAt: previous.startsAt.toISOString(),
      previousEndsAt: previous.endsAt.toISOString(),
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      ...(auditMeta ?? {}),
    },
  });
  await enqueueAndDispatch(appointment, APPOINTMENT_EVENT_TYPES.RESCHEDULED);
}
