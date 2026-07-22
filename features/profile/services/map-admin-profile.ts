import "server-only";

import type { AppUser } from "@/lib/auth";
import {
  formatFullName,
  formatUserRoleLabel,
} from "@/features/profile/lib/format";
import type { AdminProfileView } from "@/features/profile/types";

/**
 * Map a synced Mongo app user into the admin profile view model.
 */
export function toAdminProfileView(user: AppUser): AdminProfileView {
  return {
    id: String(user._id),
    clerkId: user.clerkId,
    email: user.email,
    fullName: formatFullName(user.firstName, user.lastName, user.email),
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    roleLabel: formatUserRoleLabel(user.role),
    profileImage: user.profileImage,
    joinedAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
  };
}
