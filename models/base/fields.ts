import type { SchemaDefinition } from "mongoose";

/**
 * Reusable field fragments — no business fields.
 * Compose into schemas via `createBaseSchema` or manual Schema definitions.
 */

/** Soft-delete column (`null` = not deleted). */
export const softDeleteFieldDefinition = {
  deletedAt: {
    type: Date,
    default: null,
    index: true,
  },
} satisfies SchemaDefinition;

/** Master-data operational flag. */
export const isActiveFieldDefinition = {
  isActive: {
    type: Boolean,
    default: true,
    required: true,
    index: true,
  },
} satisfies SchemaDefinition;
