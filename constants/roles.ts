/**
 * Centralized UserRole values (database + API contract).
 * @see docs/04-database-design.md §C.1
 */

export const USER_ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  PATIENT: "patient",
  RECEPTIONIST: "receptionist",
  ASSISTANT: "assistant",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES = [
  USER_ROLES.ADMIN,
  USER_ROLES.DOCTOR,
  USER_ROLES.PATIENT,
  USER_ROLES.RECEPTIONIST,
  USER_ROLES.ASSISTANT,
] as const;

/** Roles enabled for V1 product surfaces. */
export const V1_USER_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.DOCTOR,
  USER_ROLES.PATIENT,
] as const;
