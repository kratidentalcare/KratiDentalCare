import "server-only";

import { normalizeUserRole, USER_ROLES, type UserRole } from "@/constants/roles";
import { connect } from "@/lib/db";
import { User } from "@/models/user";

import { getSession } from "./get-session";

/**
 * Soft check for the public-site Dashboard link (`role === admin`).
 *
 * Uses the Clerk session `userId` + Mongo `users.role` only — does not call
 * `currentUser()`. That Clerk lookup can fail while a valid session still
 * exists, which previously hid Dashboard from real admins.
 *
 * Returns `null` when the result is unknown (config / DB errors) so UI can
 * keep a previously known value instead of hiding Dashboard.
 */
export async function canAccessStaffDashboard(): Promise<boolean | null> {
  try {
    const session = await getSession();

    if (!session) {
      return false;
    }

    await connect();

    const user = await User.findOne({ clerkId: session.userId })
      .select({ role: 1, isActive: 1 })
      .lean<{ role: UserRole; isActive: boolean } | null>();

    if (!user || !user.isActive) {
      return false;
    }

    return normalizeUserRole(user.role) === USER_ROLES.ADMIN;
  } catch {
    return null;
  }
}
