/**
 * Centralized UserRole values (database + API contract).
 * @see docs/04-database-design.md §C.1
 */

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES = [
  USER_ROLES.ADMIN,
  USER_ROLES.USER,
] as const;

/** Roles enabled for V1 product surfaces. */
export const V1_USER_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.USER,
] as const;

/**
 * Historic role strings that must be rewritten to `user` before the
 * narrowed enum is enforced on save.
 */
export const LEGACY_USER_ROLES = [
  "patient",
  "doctor",
  "staff",
  "receptionist",
  "assistant",
] as const;

export type LegacyUserRole = (typeof LEGACY_USER_ROLES)[number];

/** Maps stored role strings onto the current admin | user contract. */
export function normalizeUserRole(role: unknown): UserRole | null {
  if (role === USER_ROLES.ADMIN) {
    return USER_ROLES.ADMIN;
  }

  if (role === USER_ROLES.USER) {
    return USER_ROLES.USER;
  }

  if (
    typeof role === "string" &&
    (LEGACY_USER_ROLES as readonly string[]).includes(role)
  ) {
    return USER_ROLES.USER;
  }

  return null;
}
