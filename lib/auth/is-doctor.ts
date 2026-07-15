import "server-only";

import { USER_ROLES } from "@/constants/roles";

import { getCurrentUserRole } from "./get-current-user-role";
import type { SyncUserOptions } from "./types";

/**
 * Soft predicate: active Mongo app user has `role === doctor`.
 *
 * Reserved for the future doctor portal. Use `requireDoctor()` to enforce access.
 */
export async function isDoctor(
  options: SyncUserOptions = {},
): Promise<boolean> {
  const role = await getCurrentUserRole(options);
  return role === USER_ROLES.DOCTOR;
}
