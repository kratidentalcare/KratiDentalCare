import type { Document, Types } from "mongoose";

/**
 * Shared Mongoose document types for the database foundation.
 * No business collection shapes are defined here.
 *
 * @see docs/04-database-design.md §B
 */

/**
 * Timestamp fields managed by Mongoose `timestamps: true`.
 */
export type TimestampFields = {
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Soft-delete column. `null` means the document is not deleted.
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
 * Uses polymorphic `this` so intersecting document types keep precise returns.
 */
export interface SoftDeleteMethods {
  softDelete(): Promise<this>;
  restore(): Promise<this>;
  isDeleted(): boolean;
}

/**
 * Query helpers attached by `softDeletePlugin`.
 * Intersect with a Mongoose `Query` type at model definition time.
 */
export interface SoftDeleteQueryHelpers {
  withDeleted(): this;
  onlyDeleted(): this;
}

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

/**
 * Lean (plain object) form of a base document after `.lean()`.
 */
export type LeanBaseDocument = BaseDocumentFields;

/**
 * Lean soft-delete document shape.
 */
export type LeanSoftDeleteDocument = LeanBaseDocument & SoftDeleteFields;

/**
 * Lean soft-delete + isActive shape.
 */
export type LeanSoftActivatableDocument = LeanSoftDeleteDocument &
  ActiveFlagFields;
