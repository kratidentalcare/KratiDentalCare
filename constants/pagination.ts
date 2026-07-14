/**
 * Shared pagination defaults and limits.
 * @see docs/api/00-api-guidelines.md §7
 */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
} as const;
