import "server-only";

import { connect } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { User, type LeanUser } from "@/models/user";
import { toAdminProfileView } from "@/features/profile/services/map-admin-profile";
import type { AdminProfileView } from "@/features/profile/types";
import { profileImageSchema } from "@/validators/user";

/**
 * Persist a profile image URL on the Mongo user row only.
 * Clerk image bytes are updated separately before calling this.
 */
export async function setAdminProfileImage(
  clerkId: string,
  profileImageUrl: string,
): Promise<AdminProfileView> {
  await connect();

  const parsed = profileImageSchema.safeParse(profileImageUrl);
  if (!parsed.success || !parsed.data) {
    throw new ValidationError("Invalid profile image URL", [
      { field: "profileImage", message: "profileImage must be a valid URL" },
    ]);
  }

  const updated = await User.findOneAndUpdate(
    { clerkId },
    { $set: { profileImage: parsed.data } },
    { returnDocument: "after", runValidators: true },
  )
    .lean<LeanUser>()
    .exec();

  if (!updated) {
    throw new NotFoundError("User profile not found");
  }

  return toAdminProfileView(updated);
}
