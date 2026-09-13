import "server-only";

import { currentUser as getClerkCurrentUser } from "@clerk/nextjs/server";

import {
  normalizeUserRole,
  USER_ROLES,
  type UserRole,
} from "@/constants/roles";
import { connect } from "@/lib/db";
import { logger } from "@/lib/logger";
import { User } from "@/models/user";

import { getSession } from "./get-session";

type DashboardAccessUser = {
  _id: unknown;
  clerkId: string;
  role: UserRole | string;
  isActive: boolean;
};

async function findActiveUserByClerkId(
  clerkId: string,
): Promise<DashboardAccessUser | null> {
  return User.findOne({ clerkId })
    .select({ clerkId: 1, role: 1, isActive: 1 })
    .lean<DashboardAccessUser | null>();
}

async function findActiveUserByEmail(
  email: string,
): Promise<DashboardAccessUser | null> {
  return User.findOne({ email: email.trim().toLowerCase() })
    .select({ clerkId: 1, role: 1, isActive: 1 })
    .lean<DashboardAccessUser | null>();
}

/**
 * Soft check for the public-site Dashboard link (`role === admin`).
 *
 * Looks up Mongo by Clerk session id, then by verified email so a new Clerk
 * user id for the same admin mailbox still gets the Dashboard link.
 */
export async function canAccessStaffDashboard(): Promise<boolean | null> {
  try {
    const session = await getSession();

    if (!session) {
      return false;
    }

    await connect();

    let user = await findActiveUserByClerkId(session.userId);

    if (!user) {
      const clerkUser = await getClerkCurrentUser();
      const email = clerkUser?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
      const emailVerified =
        clerkUser?.primaryEmailAddress?.verification?.status === "verified";

      if (clerkUser && clerkUser.id === session.userId && email && emailVerified) {
        user = await findActiveUserByEmail(email);

        if (user && user.clerkId !== session.userId) {
          await User.updateOne(
            { _id: user._id },
            { $set: { clerkId: session.userId } },
          );
          logger.warn("Rebound Clerk user id for navbar admin check", {
            email,
            previousClerkId: user.clerkId,
            clerkId: session.userId,
          });
        }
      }
    }

    if (!user || !user.isActive) {
      return false;
    }

    return normalizeUserRole(user.role) === USER_ROLES.ADMIN;
  } catch {
    return null;
  }
}
