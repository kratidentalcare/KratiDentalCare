import type { SchemaDefinition } from "mongoose";

import { DB_FIELDS } from "@/constants/db";

/**
 * Reusable field fragments — no business fields.
 * Compose into schemas via `createBaseSchema` or manual Schema definitions.
 */

/** Soft-delete column (`null` = not deleted). */
export const softDeleteFieldDefinition = {
  [DB_FIELDS.DELETED_AT]: {
    type: Date,
    default: null,
    index: true,
  },
} satisfies SchemaDefinition;

/** Master-data operational flag. */
export const isActiveFieldDefinition = {
  [DB_FIELDS.IS_ACTIVE]: {
    type: Boolean,
    default: true,
    required: true,
    index: true,
  },
} satisfies SchemaDefinition;
