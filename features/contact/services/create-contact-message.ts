import "server-only";

import { CONTACT_MESSAGE_STATUSES } from "@/constants/statuses";
import { onContactMessageCreated } from "@/features/contact/services/notification-hooks";
import { connect } from "@/lib/db";
import { ValidationError } from "@/lib/errors";
import { ContactMessage } from "@/models/contact-message";
import {
  createContactMessageSchema,
  type CreateContactMessageInput,
} from "@/validators/contact-message";

export type CreatedContactMessage = {
  id: string;
};

/**
 * Persist a validated public contact-form submission.
 * Fires `onContactMessageCreated` for in-app Notification Center
 * (outbound email / WhatsApp still reserved).
 */
export async function createContactMessage(
  input: CreateContactMessageInput,
): Promise<CreatedContactMessage> {
  const parsed = createContactMessageSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid contact message",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  await connect();

  const created = await ContactMessage.create({
    ...parsed.data,
    status: CONTACT_MESSAGE_STATUSES.NEW,
  });

  const id = String(created._id);

  await onContactMessageCreated({
    contactMessageId: id,
    name: created.name,
    email: created.email,
    phone: created.phone,
    subject: created.subject,
  });

  return { id };
}
