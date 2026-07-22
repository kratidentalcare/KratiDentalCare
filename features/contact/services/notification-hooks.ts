import "server-only";

/**
 * Future notification seams for contact inquiries.
 *
 * Intentionally no-ops today. When email / WhatsApp / admin push land:
 * 1. Enqueue provider-neutral intents (similar to appointment NotificationOutbox)
 * 2. Let a worker deliver EMAIL / WHATSAPP / IN_APP channels
 * 3. Keep create/update paths free of provider SDKs
 *
 * Suggested future payload shape:
 * {
 *   contactMessageId: string
 *   name, email, phone, subject
 *   event: "CONTACT_MESSAGE_CREATED" | "CONTACT_MESSAGE_ADMIN_ALERT"
 * }
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
 * Future: enqueue visitor confirmation email + admin alert (email/WhatsApp).
 */
export async function onContactMessageCreated(
  payload: ContactNotificationPayload,
): Promise<void> {
  void payload;
  // Reserved for email / WhatsApp / admin notification workers.
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
