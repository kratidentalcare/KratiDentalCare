import "server-only";

import { ERROR_CODES } from "@/constants/error-codes";
import { HTTP_STATUS } from "@/constants/http";
import { USER_ROLE_VALUES, type UserRole } from "@/constants/roles";
import { DomainError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import { requireCurrentUser } from "./current-user";
import type { AppUser } from "./sync-user";
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
 * Asserts an already-loaded app user is usable for authorization.
 * Does not sync or touch Clerk — used after `requireCurrentUser` / sync.
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
 * Requires a valid Clerk session, synchronized Mongo `users` row, and
 * an active account with a known role.
 *
 * Roles are always read from MongoDB — never from Clerk metadata alone.
 *
 * For Clerk-session-only checks use `requireAuth()` from `./session`.
 *
 * @see docs/03-system-architecture.md §7.4
 * @see docs/api/01-authentication.md §11
 */
export async function requireAppUser(
  options: SyncUserOptions = {},
): Promise<AppUser> {
  const user = await requireCurrentUser(options);
  return assertActiveAppUser(user);
}
