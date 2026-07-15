import "server-only";

import { ForbiddenError } from "@/lib/errors";

import {
  roleHasAllPermissions,
  roleHasAnyPermission,
  roleHasPermission,
  type Permission,
} from "./permissions";
import { requireAppUser } from "./require-auth";
import { assertRole, hasAnyRole, hasRole } from "./require-role";
import type { AppUser } from "./sync-user";
import type { RoleRequirement, SyncUserOptions } from "./types";

/**
 * Pure permission check against the user's Mongo role.
 */
export function can(
  user: Pick<AppUser, "role">,
  permission: Permission,
): boolean {
  return roleHasPermission(user.role, permission);
}

/**
 * Pure check: user has every listed permission via their role.
 */
export function canAll(
  user: Pick<AppUser, "role">,
  permissions: readonly Permission[],
): boolean {
  return roleHasAllPermissions(user.role, permissions);
}

/**
 * Pure check: user has at least one listed permission via their role.
 */
export function canAny(
  user: Pick<AppUser, "role">,
  permissions: readonly Permission[],
): boolean {
  return roleHasAnyPermission(user.role, permissions);
}

/**
 * Throws `ForbiddenError` when the user lacks the permission.
 */
export function assertPermission(
  user: Pick<AppUser, "role">,
  permission: Permission,
  message?: string,
): void {
  if (can(user, permission)) {
    return;
  }

  throw new ForbiddenError(
    message ?? `Missing required permission: ${permission}`,
  );
}

/**
 * Requires an active app user that holds the given permission
 * (resolved from Mongo `users.role`, not Clerk).
 */
export async function requirePermission(
  permission: Permission,
  options: SyncUserOptions = {},
): Promise<AppUser> {
  const user = await requireAppUser(options);
  assertPermission(user, permission);
  return user;
}

/**
 * Requires an active app user that holds every listed permission.
 */
export async function requirePermissions(
  permissions: readonly Permission[],
  options: SyncUserOptions = {},
): Promise<AppUser> {
  const user = await requireAppUser(options);

  if (!canAll(user, permissions)) {
    throw new ForbiddenError("Missing one or more required permissions");
  }

  return user;
}

type AuthorizeByRole = {
  roles: RoleRequirement;
  permissions?: never;
};

type AuthorizeByPermission = {
  permissions: readonly Permission[];
  roles?: never;
  /**
   * When true (default), require every permission.
   * When false, require at least one.
   */
  requireAll?: boolean;
};

export type AuthorizeOptions = (AuthorizeByRole | AuthorizeByPermission) &
  SyncUserOptions;

/**
 * Composed authorization gate for Server Actions / layouts.
 *
 * Pass either `roles` or `permissions` (not both) — keeps call sites explicit.
 *
 * @example
 * await authorize({ roles: "admin" });
 * await authorize({ permissions: [PERMISSIONS.DASHBOARD_PATIENT] });
 */
export async function authorize(options: AuthorizeOptions): Promise<AppUser> {
  const syncOptions: SyncUserOptions = {
    touchLastLogin: options.touchLastLogin,
  };

  const user = await requireAppUser(syncOptions);

  if ("roles" in options && options.roles !== undefined) {
    assertRole(user, options.roles);
    return user;
  }

  if ("permissions" in options && options.permissions !== undefined) {
    const requireAll = options.requireAll !== false;
    const allowed = requireAll
      ? canAll(user, options.permissions)
      : canAny(user, options.permissions);

    if (!allowed) {
      throw new ForbiddenError(
        requireAll
          ? "Missing one or more required permissions"
          : "Missing required permission",
      );
    }

    return user;
  }

  throw new ForbiddenError("Authorization requirements were not specified");
}

/**
 * Re-exports of role predicates for a single authorization import surface.
 */
export { hasAnyRole, hasRole, assertRole };
