import "server-only";

import { USER_ROLES, type UserRole } from "@/constants/roles";
import { ForbiddenError } from "@/lib/errors";

import { requireAppUser } from "./require-auth";
import type { AppUser } from "./sync-user";
import type { RoleRequirement, SyncUserOptions } from "./types";

function normalizeRoles(roles: RoleRequirement): readonly UserRole[] {
  return typeof roles === "string" ? [roles] : roles;
}

/**
 * Pure check: user has exactly this role.
 */
export function hasRole(
  user: Pick<AppUser, "role">,
  role: UserRole,
): boolean {
  return user.role === role;
}

/**
 * Pure check: user has any of the listed roles.
 */
export function hasAnyRole(
  user: Pick<AppUser, "role">,
  roles: RoleRequirement,
): boolean {
  const allowed = normalizeRoles(roles);
  return allowed.includes(user.role);
}

/**
 * Throws `ForbiddenError` when the user lacks every listed role.
 */
export function assertRole(
  user: Pick<AppUser, "role">,
  roles: RoleRequirement,
  message?: string,
): void {
  if (hasAnyRole(user, roles)) {
    return;
  }

  const allowed = normalizeRoles(roles);
  throw new ForbiddenError(
    message ??
      `Requires one of the following roles: ${allowed.join(", ")}`,
  );
}

/**
 * Requires an active app user whose Mongo `role` is in the allowlist.
 *
 * @example
 * await requireRole("admin");
 * await requireRole(["admin", "doctor"]);
 */
export async function requireRole(
  roles: RoleRequirement,
  options: SyncUserOptions = {},
): Promise<AppUser> {
  const user = await requireAppUser(options);
  assertRole(user, roles);
  return user;
}

/**
 * Admin dashboard / clinic ops gate.
 */
export async function requireAdmin(
  options: SyncUserOptions = {},
): Promise<AppUser> {
  return requireRole(USER_ROLES.ADMIN, options);
}

/**
 * Patient portal gate.
 */
export async function requirePatient(
  options: SyncUserOptions = {},
): Promise<AppUser> {
  return requireRole(USER_ROLES.PATIENT, options);
}

/**
 * Doctor portal gate (future).
 */
export async function requireDoctor(
  options: SyncUserOptions = {},
): Promise<AppUser> {
  return requireRole(USER_ROLES.DOCTOR, options);
}

/**
 * Receptionist portal gate (future).
 */
export async function requireReceptionist(
  options: SyncUserOptions = {},
): Promise<AppUser> {
  return requireRole(USER_ROLES.RECEPTIONIST, options);
}
