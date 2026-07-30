import "server-only";

import { buildUserDisplayName } from "@/features/users/lib/format";
import { accessStatusFromIsActive } from "@/features/users/lib/status";
import { findUserByIdOrThrow } from "@/features/users/repositories/user-repository";
import type { UserDetail } from "@/features/users/types";
import { connect } from "@/lib/db";

export async function getUserDetail(id: string): Promise<UserDetail> {
  await connect();

  const user = await findUserByIdOrThrow(id);

  return {
    id: String(user._id),
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: buildUserDisplayName(user.firstName, user.lastName, user.email),
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: accessStatusFromIsActive(user.isActive),
    isActive: user.isActive,
    profileImage: user.profileImage,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
  };
}
