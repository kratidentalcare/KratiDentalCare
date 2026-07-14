/**
 * Shared MongoDB / Mongoose foundation constants.
 * No collection-specific or business-model constants here.
 *
 * @see docs/04-database-design.md §B
 */

/** Canonical base / soft-delete / flag field names (camelCase). */
export const DB_FIELDS = {
  ID: "_id",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  DELETED_AT: "deletedAt",
  IS_ACTIVE: "isActive",
} as const;

export type DbFieldName = (typeof DB_FIELDS)[keyof typeof DB_FIELDS];

/** MongoDB ObjectId hex string length. */
export const OBJECT_ID_HEX_LENGTH = 24;

/** Regex for a 24-char hex ObjectId (case-insensitive). */
export const OBJECT_ID_HEX_PATTERN = /^[a-f\d]{24}$/i;

/**
 * Default filter fragment: exclude soft-deleted rows.
 * Prefer the soft-delete plugin for Model queries; use this in aggregations
 * or raw filters composed in services.
 */
export const NOT_DELETED_FILTER = {
  [DB_FIELDS.DELETED_AT]: null,
} as const;

/** Filter fragment: only soft-deleted rows. */
export const ONLY_DELETED_FILTER = {
  [DB_FIELDS.DELETED_AT]: { $ne: null },
} as const;

/** Filter fragment: operationally active master data. */
export const ACTIVE_FILTER = {
  [DB_FIELDS.IS_ACTIVE]: true,
} as const;

/** Combined filter for list defaults on master entities. */
export const ACTIVE_NOT_DELETED_FILTER = {
  ...NOT_DELETED_FILTER,
  ...ACTIVE_FILTER,
} as const;
