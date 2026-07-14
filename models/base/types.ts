import type { Document, Types } from "mongoose";

/**
 * Timestamp fields managed by Mongoose `timestamps: true`.
 * @see docs/04-database-design.md §B
 */
export type TimestampFields = {
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Soft-delete column. `null` means the document is active in queries.
 */
export type SoftDeleteFields = {
  deletedAt: Date | null;
};

/**
 * Operational enablement flag for master/config entities.
 */
export type ActiveFlagFields = {
  isActive: boolean;
};

/**
 * Common document identity + timestamps every model should expose.
 */
export type BaseDocumentFields = TimestampFields & {
  _id: Types.ObjectId;
};

/**
 * Mongoose document with base timestamps.
 */
export type BaseDocument = Document & BaseDocumentFields;

/**
 * Soft-delete method surface attached by `softDeletePlugin`.
 */
export type SoftDeleteMethods = {
  softDelete(): Promise<SoftDeleteDocument>;
  restore(): Promise<SoftDeleteDocument>;
  isDeleted(): boolean;
};

/**
 * Document supporting soft delete helpers (from softDeletePlugin).
 */
export type SoftDeleteDocument = BaseDocument &
  SoftDeleteFields &
  SoftDeleteMethods;

/**
 * Document with `isActive` master-data flag.
 */
export type ActivatableDocument = BaseDocument & ActiveFlagFields;

/**
 * Soft-delete + isActive composition used by most master entities later.
 */
export type SoftActivatableDocument = SoftDeleteDocument & ActiveFlagFields;
