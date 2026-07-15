import "server-only";

import { USER_ROLES } from "@/constants/roles";

import { getCurrentUserRole } from "./get-current-user-role";
import type { SyncUserOptions } from "./types";

/**
 * Soft predicate: active Mongo app user has `role === patient`.
 *
 * Use for conditional UI. Use `requirePatient()` to enforce access.
 */
export async function isPatient(
  options: SyncUserOptions = {},
): Promise<boolean> {
  const role = await getCurrentUserRole(options);
  return role === USER_ROLES.PATIENT;
}
