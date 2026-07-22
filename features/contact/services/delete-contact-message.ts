import "server-only";

import { Types } from "mongoose";

import { connect } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { ContactMessage } from "@/models/contact-message";

/**
 * Soft-delete an inquiry from the Admin Inbox.
 */
export async function deleteContactMessage(id: string): Promise<void> {
  await connect();

  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid contact message id");
  }

  const doc = await ContactMessage.findById(id);
  if (!doc) {
    throw new NotFoundError("Contact message not found");
  }

  await doc.softDelete();
}
