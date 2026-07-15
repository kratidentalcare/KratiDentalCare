import "server-only";

import { USER_ROLES } from "@/constants/roles";

import { getCurrentUserRole } from "./get-current-user-role";
import type { SyncUserOptions } from "./types";

/**
 * Soft predicate: active Mongo app user has `role === admin`.
 *
 * Use for conditional UI (show admin link). Use `requireAdmin()` to deny
 * unauthorized access in layouts / Server Actions.
 */
export async function isAdmin(
  options: SyncUserOptions = {},
): Promise<boolean> {
  const role = await getCurrentUserRole(options);
  return role === USER_ROLES.ADMIN;
}
