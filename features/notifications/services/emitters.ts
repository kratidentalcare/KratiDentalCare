import "server-only";

import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_RELATED_ENTITY_TYPES,
  NOTIFICATION_TYPES,
} from "@/constants/notifications";
import { ROUTES } from "@/constants/routes";
import { createNotification } from "@/features/notifications/services/create-notification";
import type { LeanAppointment } from "@/models/appointment";

function formatAppointmentWhen(startsAt: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startsAt);
}

/**
 * Domain helpers — keep copy + routing centralized for appointment events.
 * Call these from lifecycle hooks; do not invent ad-hoc notifications elsewhere.
 */

export async function notifyNewAppointment(
  appointment: LeanAppointment,
): Promise<void> {
  const id = String(appointment._id);
  const patient = appointment.patientSnapshot.fullName;
  const when = formatAppointmentWhen(appointment.startsAt);

  await createNotification({
    type: NOTIFICATION_TYPES.APPOINTMENT,
    event: NOTIFICATION_EVENTS.APPOINTMENT_CREATED,
    title: "New appointment",
    description: `${patient} booked with ${appointment.doctorSnapshot.fullName} · ${when}`,
    href: ROUTES.DASHBOARD.APPOINTMENTS,
    relatedEntityType: NOTIFICATION_RELATED_ENTITY_TYPES.APPOINTMENT,
    relatedEntityId: id,
    idempotencyKey: `appointment:${id}:${NOTIFICATION_EVENTS.APPOINTMENT_CREATED}`,
    metadata: {
      status: appointment.status,
      doctorName: appointment.doctorSnapshot.fullName,
    },
  });
}

export async function notifyAppointmentCancelled(
  appointment: LeanAppointment,
  cancellationReason?: string,
): Promise<void> {
  const id = String(appointment._id);
  const patient = appointment.patientSnapshot.fullName;
  const reasonSuffix = cancellationReason?.trim()
    ? ` · ${cancellationReason.trim()}`
    : "";

  await createNotification({
    type: NOTIFICATION_TYPES.APPOINTMENT,
    event: NOTIFICATION_EVENTS.APPOINTMENT_CANCELLED,
    title: "Appointment cancelled",
    description: `${patient}'s visit with ${appointment.doctorSnapshot.fullName} was cancelled${reasonSuffix}`,
    href: ROUTES.DASHBOARD.APPOINTMENTS,
    relatedEntityType: NOTIFICATION_RELATED_ENTITY_TYPES.APPOINTMENT,
    relatedEntityId: id,
    idempotencyKey: `appointment:${id}:${NOTIFICATION_EVENTS.APPOINTMENT_CANCELLED}`,
    metadata: {
      cancellationReason: cancellationReason ?? null,
    },
  });
}

export async function notifyAppointmentCompleted(
  appointment: LeanAppointment,
): Promise<void> {
  const id = String(appointment._id);
  const patient = appointment.patientSnapshot.fullName;

  await createNotification({
    type: NOTIFICATION_TYPES.APPOINTMENT,
    event: NOTIFICATION_EVENTS.APPOINTMENT_COMPLETED,
    title: "Appointment completed",
    description: `${patient}'s visit with ${appointment.doctorSnapshot.fullName} is complete`,
    href: ROUTES.DASHBOARD.APPOINTMENTS,
    relatedEntityType: NOTIFICATION_RELATED_ENTITY_TYPES.APPOINTMENT,
    relatedEntityId: id,
    idempotencyKey: `appointment:${id}:${NOTIFICATION_EVENTS.APPOINTMENT_COMPLETED}`,
  });
}

export async function notifyNewContactInquiry(input: {
  contactMessageId: string;
  name: string;
  subject: string;
}): Promise<void> {
  const { contactMessageId, name, subject } = input;

  await createNotification({
    type: NOTIFICATION_TYPES.INQUIRY,
    event: NOTIFICATION_EVENTS.CONTACT_INQUIRY_CREATED,
    title: "New contact inquiry",
    description: `${name} · ${subject}`,
    href: ROUTES.DASHBOARD.INBOX,
    relatedEntityType: NOTIFICATION_RELATED_ENTITY_TYPES.CONTACT_MESSAGE,
    relatedEntityId: contactMessageId,
    idempotencyKey: `contact_message:${contactMessageId}:${NOTIFICATION_EVENTS.CONTACT_INQUIRY_CREATED}`,
  });
}
