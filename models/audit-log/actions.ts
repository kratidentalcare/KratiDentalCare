/**
 * Internal audit actions for privileged user-management mutations.
 */

export const AUDIT_ACTIONS = {
  ROLE_CHANGED: "ROLE_CHANGED",
  USER_DISABLED: "USER_DISABLED",
  USER_ENABLED: "USER_ENABLED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_ACTION_VALUES = [
  AUDIT_ACTIONS.ROLE_CHANGED,
  AUDIT_ACTIONS.USER_DISABLED,
  AUDIT_ACTIONS.USER_ENABLED,
] as const;
