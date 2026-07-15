import "server-only";

import { currentUser as getClerkCurrentUser } from "@clerk/nextjs/server";

import { UnauthorizedError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import { getAuthSession } from "./session";
import { syncClerkUser, type AppUser } from "./sync-user";
import type { SyncUserOptions } from "./types";

/**
 * Soft read of the authenticated application user.
 *
 * - No Clerk session → `null`
 * - Valid session → synchronize Clerk → Mongo and return the app user
 *
 * Does **not** enforce role or `isActive` (authorization is a later phase).
 */
export async function getCurrentUser(
  options: SyncUserOptions = {},
): Promise<AppUser | null> {
  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  const clerkUser = await getClerkCurrentUser();

  if (!clerkUser) {
    logger.warn("Clerk session present but currentUser() returned null", {
      clerkId: session.userId,
    });
    throw new UnauthorizedError("Invalid session");
  }

  if (clerkUser.id !== session.userId) {
    logger.error("Clerk session / currentUser identity mismatch", undefined, {
      sessionUserId: session.userId,
      clerkUserId: clerkUser.id,
    });
    throw new UnauthorizedError("Invalid session");
  }

  return syncClerkUser(clerkUser, options);
}

/**
 * Requires a valid Clerk session and a synchronized Mongo `users` document.
 * Throws `UnauthorizedError` when there is no session.
 *
 * Does **not** enforce role or `isActive` (authorization is a later phase).
 */
export async function requireCurrentUser(
  options: SyncUserOptions = {},
): Promise<AppUser> {
  const user = await getCurrentUser(options);

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

/**
 * Architecture alias used in system docs (`getAppUser`).
 * Soft read — returns `null` when unauthenticated.
 */
export const getAppUser = getCurrentUser;
