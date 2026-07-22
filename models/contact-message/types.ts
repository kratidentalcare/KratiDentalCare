import type { Model } from "mongoose";

import type { ContactMessageStatus } from "@/constants/statuses";
import type {
  LeanSoftDeleteDocument,
  SoftDeleteDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Public contact-form submission stored for later admin review.
 */
export type ContactMessageFields = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
};

export type ContactMessageDocument = SoftDeleteDocument & ContactMessageFields;

export type LeanContactMessage = LeanSoftDeleteDocument & ContactMessageFields;

export type ContactMessageModel = Model<
  ContactMessageDocument,
  SoftDeleteQueryHelpers
>;
