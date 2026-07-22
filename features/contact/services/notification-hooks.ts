import "server-only";

import { notifyNewContactInquiry } from "@/features/notifications/services/emitters";

/**
 * Contact inquiry notification seams.
 *
 * In-app admin Notification Center is wired today.
 * Email / WhatsApp delivery remains reserved for a future worker
 * (similar to appointment `NotificationOutbox`).
 */

export type ContactNotificationEvent =
  | "CONTACT_MESSAGE_CREATED"
  | "CONTACT_MESSAGE_ADMIN_ALERT";

export type ContactNotificationPayload = {
  contactMessageId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
};

/**
 * Hook after a public inquiry is persisted.
 * Creates an in-app admin notification; outbound channels TBD.
 */
export async function onContactMessageCreated(
  payload: ContactNotificationPayload,
): Promise<void> {
  await notifyNewContactInquiry({
    contactMessageId: payload.contactMessageId,
    name: payload.name,
    subject: payload.subject,
  });
}

/**
 * Hook after an admin archives or deletes an inquiry (optional digests later).
 */
export async function onContactMessageStatusChanged(
  payload: ContactNotificationPayload & {
    status: string;
    event: ContactNotificationEvent;
  },
): Promise<void> {
  void payload;
  // Reserved for admin notification digests.
}
