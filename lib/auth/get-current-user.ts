import "server-only";

import { currentUser as getClerkCurrentUser } from "@clerk/nextjs/server";

import { ERROR_CODES } from "@/constants/error-codes";
import { HTTP_STATUS } from "@/constants/http";
import { USER_ROLE_VALUES, type UserRole } from "@/constants/roles";
import { DomainError, UnauthorizedError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import { getSession } from "./get-session";
import { syncClerkUser, type AppUser } from "./sync-user";
import type { SyncUserOptions } from "./types";

function isKnownRole(role: unknown): role is UserRole {
  return (
    typeof role === "string" &&
    (USER_ROLE_VALUES as readonly string[]).includes(role)
  );
}

function accountDisabledError(message?: string): DomainError {
  return new DomainError(
    ERROR_CODES.ACCOUNT_DISABLED,
    message ?? "This account has been disabled",
    HTTP_STATUS.FORBIDDEN,
  );
}

function userNotSyncedError(message: string): DomainError {
  return new DomainError(
    ERROR_CODES.USER_NOT_SYNCED,
    message,
    HTTP_STATUS.UNAUTHORIZED,
  );
}

/**
 * Asserts an already-loaded app user is usable (active + known role).
 *
 * Failure modes:
 * - soft-deleted / inactive → `ACCOUNT_DISABLED`
 * - missing / unknown role → `USER_NOT_SYNCED`
 */
export function assertActiveAppUser(user: AppUser): AppUser {
  if (user.deletedAt != null) {
    logger.warn("Rejected soft-deleted app user", { clerkId: user.clerkId });
    throw accountDisabledError("This account has been deactivated");
  }

  if (!user.isActive) {
    logger.warn("Rejected inactive app user", { clerkId: user.clerkId });
    throw accountDisabledError();
  }

  if (!isKnownRole(user.role)) {
    logger.error("App user is missing a valid role", undefined, {
      clerkId: user.clerkId,
      role: String(user.role),
    });
    throw userNotSyncedError("User role is missing or invalid");
  }

  return user;
}

/**
 * Soft read of the synchronized Mongo app user.
 *
 * - No Clerk session → `null`
 * - Valid session → upsert/sync Clerk → Mongo and return the user
 *
 * Does **not** reject inactive accounts — use {@link getCurrentUserOrThrow}
 * or soft role helpers (`isAdmin`, …) when activity matters.
 */
export async function getCurrentUser(
  options: SyncUserOptions = {},
): Promise<AppUser | null> {
  const session = await getSession();

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
 * Soft read of an **active** synchronized app user.
 * Returns `null` for missing session, inactive, soft-deleted, or invalid role.
 */
export async function getActiveCurrentUser(
  options: SyncUserOptions = {},
): Promise<AppUser | null> {
  const user = await getCurrentUser(options);

  if (!user) {
    return null;
  }

  try {
    return assertActiveAppUser(user);
  } catch (error) {
    if (
      error instanceof DomainError &&
      (error.code === ERROR_CODES.ACCOUNT_DISABLED ||
        error.code === ERROR_CODES.USER_NOT_SYNCED)
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Requires a synchronized, active Mongo app user with a known role.
 *
 * Throws:
 * - `UNAUTHORIZED` — missing session
 * - `ACCOUNT_DISABLED` — inactive / soft-deleted
 * - `USER_NOT_SYNCED` — missing / invalid role
 */
export async function getCurrentUserOrThrow(
  options: SyncUserOptions = {},
): Promise<AppUser> {
  const user = await getCurrentUser(options);

  if (!user) {
    throw new UnauthorizedError();
  }

  return assertActiveAppUser(user);
}

/**
 * Requires a Clerk session + synced Mongo user (does not enforce `isActive`).
 * Prefer {@link getCurrentUserOrThrow} for protected mutations / layouts.
 */
export async function requireSyncedUser(
  options: SyncUserOptions = {},
): Promise<AppUser> {
  const user = await getCurrentUser(options);

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

/** Architecture alias — soft read, same as {@link getCurrentUser}. */
export const getAppUser = getCurrentUser;
