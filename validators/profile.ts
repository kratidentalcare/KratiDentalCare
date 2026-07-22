import { z } from "zod";

import { optionalPhoneSchema } from "@/validators/clinic-settings";

const PROFILE_NAME_MAX = 100;

/**
 * Admin profile edit form — name + phone only.
 * Email stays Clerk-owned and is never accepted from the client.
 */
export const updateAdminProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .max(PROFILE_NAME_MAX * 2, "Full name is too long"),
    phoneNumber: optionalPhoneSchema,
  })
  .strict();

export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;

/** Allowed profile image MIME types. */
export const PROFILE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export const profileImageFileSchema = z
  .instanceof(File, { message: "Profile image is required" })
  .refine(
    (file) =>
      (PROFILE_IMAGE_MIME_TYPES as readonly string[]).includes(file.type),
    "Profile image must be JPEG, PNG, or WebP",
  )
  .refine(
    (file) => file.size > 0 && file.size <= PROFILE_IMAGE_MAX_BYTES,
    "Profile image must be 2 MB or smaller",
  );
