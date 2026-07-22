import { z } from "zod";

import {
  emailSchema,
  nonEmptyStringSchema,
  phoneSchema,
} from "@/validators/common";

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
