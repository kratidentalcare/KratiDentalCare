import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

import { connect } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { User, type LeanUser } from "@/models/user";
import { splitFullName } from "@/features/profile/lib/format";
import { toAdminProfileView } from "@/features/profile/services/map-admin-profile";
import type { AdminProfileView } from "@/features/profile/types";
import type { UpdateAdminProfileInput } from "@/validators/profile";
import { profileImageSchema } from "@/validators/user";

type UpdateAdminProfileParams = {
  clerkId: string;
  input: UpdateAdminProfileInput;
  profileImageUrl?: string | null;
};

/**
 * Persist admin-editable profile fields to Mongo and mirror name to Clerk.
 * Email / role / auth credentials are never mutated here.
 */
export async function updateAdminProfile(
  params: UpdateAdminProfileParams,
): Promise<AdminProfileView> {
  await connect();

  const { firstName, lastName } = splitFullName(params.input.fullName);
  const phoneNumber = params.input.phoneNumber;

  const setFields: {
    firstName: string;
    lastName: string | null;
    phoneNumber: string | null;
    profileImage?: string | null;
  } = {
    firstName,
    lastName,
    phoneNumber,
  };

  if (params.profileImageUrl !== undefined) {
    const parsed = profileImageSchema.safeParse(params.profileImageUrl);
    if (!parsed.success) {
      throw new ValidationError("Invalid profile image URL", [
        { field: "profileImage", message: "profileImage must be a valid URL" },
      ]);
    }
    setFields.profileImage = parsed.data ?? null;
  }

  try {
    const client = await clerkClient();
    await client.users.updateUser(params.clerkId, {
      firstName,
      lastName: lastName ?? "",
    });
  } catch (error) {
    logger.error("Failed to mirror profile name to Clerk", error, {
      clerkId: params.clerkId,
    });
    throw new ValidationError(
      "Unable to update your Clerk account name. Please try again.",
    );
  }

  const updated = await User.findOneAndUpdate(
    { clerkId: params.clerkId },
    { $set: setFields },
    { returnDocument: "after", runValidators: true },
  )
    .lean<LeanUser>()
    .exec();

  if (!updated) {
    throw new NotFoundError("User profile not found");
  }

  return toAdminProfileView(updated);
}
