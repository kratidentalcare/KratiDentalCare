import "server-only";

import type { UserRole } from "@/constants/roles";

import { getActiveCurrentUser } from "./get-current-user";
import type { SyncUserOptions } from "./types";

/**
 * Soft read of the active Mongo app user's role.
 *
 * Returns `null` when:
 * - there is no session
 * - sync is unavailable / user missing
 * - account is inactive or soft-deleted
 * - role is missing / unknown
 *
 * Roles always come from MongoDB — never from Clerk metadata.
 */
export async function getCurrentUserRole(
  options: SyncUserOptions = {},
): Promise<UserRole | null> {
  const user = await getActiveCurrentUser(options);
  return user?.role ?? null;
}
