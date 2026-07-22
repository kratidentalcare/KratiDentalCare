import { z } from "zod";

import { CONTACT_MESSAGE_STATUSES } from "@/constants/statuses";
import {
  contactMessageStatusSchema,
  emailSchema,
  nonEmptyStringSchema,
  objectIdSchema,
  phoneSchema,
} from "@/validators/common";
import { paginationQuerySchema } from "@/validators/pagination";

export const contactMessageFormSchema = z.object({
  name: nonEmptyStringSchema.max(120, "Name is too long"),
  email: emailSchema,
  phone: phoneSchema,
  subject: nonEmptyStringSchema.max(160, "Subject is too long"),
  message: nonEmptyStringSchema
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

export type ContactMessageFormValues = z.infer<typeof contactMessageFormSchema>;

export const createContactMessageSchema = contactMessageFormSchema;

export type CreateContactMessageInput = ContactMessageFormValues;

const contactMessageStatusFilterSchema = z
  .enum([
    "all",
    CONTACT_MESSAGE_STATUSES.NEW,
    CONTACT_MESSAGE_STATUSES.READ,
    CONTACT_MESSAGE_STATUSES.ARCHIVED,
  ])
  .default("all");

/** Admin Inbox list query — search, status filter, pagination. */
export const contactMessageListQuerySchema = paginationQuerySchema.extend({
  status: contactMessageStatusFilterSchema,
});

export type ContactMessageListQuery = z.infer<
  typeof contactMessageListQuerySchema
>;

/** Admin status transition (read / unread / archive). */
export const updateContactMessageStatusSchema = z.object({
  id: objectIdSchema,
  status: contactMessageStatusSchema,
});

export type UpdateContactMessageStatusInput = z.infer<
  typeof updateContactMessageStatusSchema
>;

export const deleteContactMessageSchema = z.object({
  id: objectIdSchema,
});

export type DeleteContactMessageInput = z.infer<
  typeof deleteContactMessageSchema
>;
