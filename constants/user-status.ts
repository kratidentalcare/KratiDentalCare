/**
 * App-user access status for User & Role Management.
 * Persisted as `users.isActive` (true → ACTIVE, false → DISABLED).
 */

export const USER_ACCESS_STATUSES = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;

export type UserAccessStatus =
  (typeof USER_ACCESS_STATUSES)[keyof typeof USER_ACCESS_STATUSES];

export const USER_ACCESS_STATUS_VALUES = [
  USER_ACCESS_STATUSES.ACTIVE,
  USER_ACCESS_STATUSES.DISABLED,
] as const;
