import "server-only";

import { getOrCreateModel } from "@/models/base";

import {
  CONTACT_MESSAGE_MODEL_NAME,
  contactMessageSchema,
} from "./schema";
import type {
  ContactMessageDocument,
  ContactMessageModel,
} from "./types";

/**
 * ContactMessage model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const ContactMessage = getOrCreateModel<ContactMessageDocument>(
  CONTACT_MESSAGE_MODEL_NAME,
  contactMessageSchema,
) as ContactMessageModel;

export type {
  ContactMessageDocument,
  ContactMessageFields,
  ContactMessageModel,
  LeanContactMessage,
} from "./types";
export {
  CONTACT_MESSAGE_MODEL_NAME,
  contactMessageSchema,
} from "./schema";
