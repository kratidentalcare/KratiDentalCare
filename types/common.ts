/**
 * Shared primitive / domain-adjacent types (no Mongoose models).
 * Mongoose document types live in `@/models/base`.
 */

export type ObjectIdString = string;

/**
 * Soft-delete + timestamp shape from the base schema convention.
 * Mirrored for DTO / API layers that should not import Mongoose.
 *
 * @see docs/04-database-design.md §B
 * @see `@/models/base` for Document-aware variants
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

/** Plain DTO baseline used outside Mongoose hydrated documents. */
export type BaseEntityDto = BaseTimestamps & {
  id: ObjectIdString;
};

export type SoftDeleteEntityDto = BaseEntityDto & SoftDeleteFields;

export type SoftActivatableEntityDto = SoftDeleteEntityDto & ActiveFlag;

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LoggerContext = Record<
  string,
  string | number | boolean | null | undefined
>;
