"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { toAdminProfileView } from "@/features/profile/services/map-admin-profile";
import { setAdminProfileImage } from "@/features/profile/services/set-admin-profile-image";
import { updateAdminProfile } from "@/features/profile/services/update-admin-profile";
import { uploadAdminProfileImage } from "@/features/profile/services/upload-profile-image";
import type { AdminProfileView } from "@/features/profile/types";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult } from "@/types/api";
import {
  profileImageFileSchema,
  updateAdminProfileSchema,
} from "@/validators/profile";

function revalidateProfileSurfaces() {
  revalidatePath(ROUTES.DASHBOARD.PROFILE);
  revalidatePath(ROUTES.DASHBOARD.ROOT);
  // Header avatar + layout user chrome.
  revalidatePath("/dashboard", "layout");
}

/**
 * Update the signed-in admin's full name and phone number.
 */
export async function updateAdminProfileAction(
  input: unknown,
): Promise<ActionResult<AdminProfileView>> {
  try {
    const user = await requireAdmin({ touchLastLogin: false });

    const parsed = updateAdminProfileSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const profile = await updateAdminProfile({
      clerkId: user.clerkId,
      input: parsed.data,
    });

    revalidateProfileSurfaces();
    return toActionResult(successResponse(profile));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

/**
 * Upload / replace the signed-in admin's profile photo.
 * Accepts multipart FormData with field `profileImage`.
 */
export async function uploadAdminProfileImageAction(
  formData: FormData,
): Promise<ActionResult<AdminProfileView>> {
  try {
    const user = await requireAdmin({ touchLastLogin: false });

    const file = formData.get("profileImage");
    const parsed = profileImageFileSchema.safeParse(file);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const imageUrl = await uploadAdminProfileImage(user.clerkId, parsed.data);
    const profile = await setAdminProfileImage(user.clerkId, imageUrl);

    revalidateProfileSurfaces();
    return toActionResult(successResponse(profile));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

/**
 * Soft read helper for clients that already have a synced user payload.
 * Prefer the page server component for initial render.
 */
export async function getAdminProfileAction(): Promise<
  ActionResult<AdminProfileView>
> {
  try {
    const user = await requireAdmin({ touchLastLogin: false });
    return toActionResult(successResponse(toAdminProfileView(user)));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
