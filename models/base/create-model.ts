import "server-only";

import mongoose, {
  type InferSchemaType,
  type Model,
  type Schema,
} from "mongoose";

/**
 * Flatten schema path names including nested subdocuments.
 * Used to detect HMR field renames (e.g. socialLinks.linkedin → twitter).
 */
function collectSchemaPaths(schema: Schema, prefix = ""): string[] {
  const paths: string[] = [];

  schema.eachPath((pathname, schemaType) => {
    const full = prefix ? `${prefix}.${pathname}` : pathname;
    paths.push(full);

    const nested = (
      schemaType as { schema?: Schema }
    ).schema;
    if (nested) {
      paths.push(...collectSchemaPaths(nested, full));
    }
  });

  return paths;
}

function schemaPathSignature(schema: Schema): string {
  return collectSchemaPaths(schema).sort().join("\0");
}

/**
 * Registers a Mongoose model idempotently (safe under Next.js HMR).
 * Always prefer this helper over calling `mongoose.model` directly.
 *
 * When the schema paths change (common during HMR field renames), the cached
 * model is dropped and re-registered so new fields are not silently stripped.
 */
export function getOrCreateModel<DocType>(
  name: string,
  schema: Schema,
): Model<DocType> {
  const existing = mongoose.models[name] as Model<DocType> | undefined;

  if (existing) {
    const samePaths =
      schemaPathSignature(existing.schema) === schemaPathSignature(schema);

    if (samePaths) {
      return existing;
    }

    delete mongoose.models[name];
    delete mongoose.connection.models[name];
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
