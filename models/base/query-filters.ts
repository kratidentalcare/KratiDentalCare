import {
  ACTIVE_FILTER,
  ACTIVE_NOT_DELETED_FILTER,
  NOT_DELETED_FILTER,
  ONLY_DELETED_FILTER,
} from "@/constants/db";

/**
 * Soft-delete / active query fragments for services and aggregations.
 * Model queries with `softDeletePlugin` apply `NOT_DELETED_FILTER` automatically.
 */

export const notDeletedFilter = NOT_DELETED_FILTER;
export const onlyDeletedFilter = ONLY_DELETED_FILTER;
export const activeFilter = ACTIVE_FILTER;
export const activeNotDeletedFilter = ACTIVE_NOT_DELETED_FILTER;

/**
 * Builds a typed filter that also scopes by caller-provided criteria.
 * Does not mutate the input object.
 */
export function withNotDeletedFilter<T extends Record<string, unknown>>(
  filter: T,
): T & typeof NOT_DELETED_FILTER {
  return {
    ...filter,
    ...NOT_DELETED_FILTER,
  };
}

/**
 * Master-data list default: active and not soft-deleted.
 */
export function withActiveNotDeletedFilter<T extends Record<string, unknown>>(
  filter: T,
): T & typeof ACTIVE_NOT_DELETED_FILTER {
  return {
    ...filter,
    ...ACTIVE_NOT_DELETED_FILTER,
  };
}
