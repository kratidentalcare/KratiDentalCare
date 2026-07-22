import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

import {
  isCloudinaryConfigured,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_MIME_TYPES,
} from "@/validators/profile";

/**
 * Upload a profile image using Cloudinary when configured; always mirror
 * the bytes to Clerk so the next Clerk→Mongo sync stays consistent.
 */
export async function uploadAdminProfileImage(
  clerkId: string,
  file: File,
): Promise<string> {
  if (
    !(PROFILE_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    throw new ValidationError("Profile image must be JPEG, PNG, or WebP", [
      { field: "profileImage", message: "Unsupported image type" },
    ]);
  }

  if (file.size <= 0 || file.size > PROFILE_IMAGE_MAX_BYTES) {
    throw new ValidationError("Profile image must be 2 MB or smaller", [
      { field: "profileImage", message: "Image exceeds the 2 MB limit" },
    ]);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const blob = new Blob([bytes], { type: file.type });

  let cloudinaryUrl: string | null = null;

  if (isCloudinaryConfigured()) {
    try {
      const uploaded = await uploadImageToCloudinary({
        bytes,
        mimeType: file.type,
        folder: `kratidentalcare/users/${clerkId}`,
        fileName: file.name || "profile",
      });
      cloudinaryUrl = uploaded.secureUrl;
    } catch (error) {
      logger.error("Cloudinary profile image upload failed", error, {
        clerkId,
      });
      throw error;
    }
  }

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.updateUserProfileImage(clerkId, {
      file: blob,
    });

    // Prefer Cloudinary CDN when available; otherwise Clerk-hosted image.
    return cloudinaryUrl ?? clerkUser.imageUrl;
  } catch (error) {
    logger.error("Clerk profile image upload failed", error, { clerkId });
    throw new ValidationError(
      "Unable to update your profile photo. Please try again.",
      [{ field: "profileImage", message: "Image upload failed" }],
    );
  }
}
