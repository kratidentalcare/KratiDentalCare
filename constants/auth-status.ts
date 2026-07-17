/**
 * Canonical reasons for the `/auth/status` fallback page.
 * Used by page guards — not for API ActionResult codes.
 */

export const AUTH_STATUS_REASONS = {
  FORBIDDEN: "forbidden",
  ACCOUNT_DISABLED: "account-disabled",
  USER_NOT_SYNCED: "user-not-synced",
} as const;

export type AuthStatusReason =
  (typeof AUTH_STATUS_REASONS)[keyof typeof AUTH_STATUS_REASONS];

export const AUTH_STATUS_REASON_VALUES = [
  AUTH_STATUS_REASONS.FORBIDDEN,
  AUTH_STATUS_REASONS.ACCOUNT_DISABLED,
  AUTH_STATUS_REASONS.USER_NOT_SYNCED,
] as const;

export function isAuthStatusReason(
  value: string | null | undefined,
): value is AuthStatusReason {
  return (
    typeof value === "string" &&
    (AUTH_STATUS_REASON_VALUES as readonly string[]).includes(value)
  );
}
