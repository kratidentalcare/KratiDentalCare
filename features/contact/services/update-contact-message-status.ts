import "server-only";

import { Types } from "mongoose";

import { toContactMessageListItem } from "@/features/contact/services/mappers";
import type { ContactMessageListItem } from "@/features/contact/types";
import { connect } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  ContactMessage,
  type LeanContactMessage,
} from "@/models/contact-message";
import type { ContactMessageStatus } from "@/constants/statuses";

/**
 * Update inquiry lifecycle status (NEW / READ / ARCHIVED).
 */
export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<ContactMessageListItem> {
  await connect();

  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid contact message id");
  }

  const updated = await ContactMessage.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true },
  ).lean<LeanContactMessage | null>();

  if (!updated) {
    throw new NotFoundError("Contact message not found");
  }

  return toContactMessageListItem(updated);
}
