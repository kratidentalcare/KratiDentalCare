/**
 * Shared primitive / domain-adjacent types (no Mongoose models).
 */

export type ObjectIdString = string;

/**
 * Soft-delete + timestamp shape from the base schema convention.
 * @see docs/04-database-design.md §B
 */
export type BaseTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type SoftDeleteFields = {
  deletedAt: Date | null;
};

export type ActiveFlag = {
  isActive: boolean;
};

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LoggerContext = Record<
  string,
  string | number | boolean | null | undefined
>;
