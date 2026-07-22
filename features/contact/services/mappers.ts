import "server-only";

import { CONTACT_MESSAGE_STATUSES } from "@/constants/statuses";
import type { ContactMessageListItem } from "@/features/contact/types";
import type { LeanContactMessage } from "@/models/contact-message";

export function toContactMessageListItem(
  doc: LeanContactMessage,
): ContactMessageListItem {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    subject: doc.subject,
    message: doc.message,
    status: doc.status,
    isRead: doc.status !== CONTACT_MESSAGE_STATUSES.NEW,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}
