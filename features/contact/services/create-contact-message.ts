import "server-only";

import { CONTACT_MESSAGE_STATUSES } from "@/constants/statuses";
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

  return { id: String(created._id) };
}
