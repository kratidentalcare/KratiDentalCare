import type { SchemaOptions } from "mongoose";

/**
 * Shared Schema options applied to every domain model.
 * Business schemas should apply these via `createBaseSchema`.
 */
export const baseSchemaOptions: SchemaOptions = {
  timestamps: true,
  versionKey: false,
  minimize: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
};

/**
 * Options accepted when creating a schema from the base factory.
 */
export type CreateBaseSchemaOptions = {
  /** Enables `deletedAt` + soft-delete plugin behavior. Default: true */
  softDelete?: boolean;
  /** Adds `isActive` boolean field (default true). Default: false */
  isActive?: boolean;
  /** Optional MongoDB collection name override. */
  collection?: string;
  /** Extra Mongoose schema options merged after base options. */
  schemaOptions?: SchemaOptions;
};
