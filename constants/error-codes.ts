/**
 * Stable machine error codes for API / Server Action contracts.
 * @see docs/api/00-api-guidelines.md §9
 */

export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  /** Public guest already has an open/upcoming appointment. */
  ACTIVE_BOOKING_EXISTS: "ACTIVE_BOOKING_EXISTS",
  /** Staff create needs an explicit multi-appointment confirmation. */
  ACTIVE_BOOKING_CONFIRMATION_REQUIRED: "ACTIVE_BOOKING_CONFIRMATION_REQUIRED",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  /** Clerk session exists but Mongo `users` row cannot be resolved/created. */
  USER_NOT_SYNCED: "USER_NOT_SYNCED",
  /** Mongo user exists but is inactive or soft-deleted. */
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
