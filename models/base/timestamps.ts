import type { SchemaOptions } from "mongoose";

import { DB_FIELDS } from "@/constants/db";

/**
 * Shared timestamp configuration for every domain schema.
 * Relies on Mongoose built-in `timestamps` (no custom plugin needed).
 *
 * @see docs/04-database-design.md §B
 */
export const TIMESTAMP_SCHEMA_OPTIONS = {
  timestamps: {
    createdAt: DB_FIELDS.CREATED_AT,
    updatedAt: DB_FIELDS.UPDATED_AT,
  },
} as const satisfies Pick<SchemaOptions, "timestamps">;

/**
 * Explicit path names — useful when composing indexes or filters without magic strings.
 */
export const TIMESTAMP_FIELD_NAMES = [
  DB_FIELDS.CREATED_AT,
  DB_FIELDS.UPDATED_AT,
] as const;
