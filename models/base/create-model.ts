import "server-only";

import mongoose, {
  type InferSchemaType,
  type Model,
  type Schema,
} from "mongoose";

/**
 * Registers a Mongoose model idempotently (safe under Next.js HMR).
 * Always prefer this helper over calling `mongoose.model` directly.
 */
export function getOrCreateModel<DocType>(
  name: string,
  schema: Schema,
): Model<DocType> {
  const existing = mongoose.models[name] as Model<DocType> | undefined;
  if (existing) {
    return existing;
  }

  return mongoose.model<DocType>(name, schema);
}

/**
 * Convenience helper: create model from an already-built base schema.
 * Equivalent to `getOrCreateModel`, named for readable call sites.
 */
export function registerModel<DocType>(
  name: string,
  schema: Schema,
): Model<DocType> {
  return getOrCreateModel<DocType>(name, schema);
}

/**
 * Infer the lean document type from a schema (optional ergonomic re-export).
 */
export type InferModelType<S extends Schema> = InferSchemaType<S>;
