import { Schema, type SchemaDefinition, type SchemaOptions } from "mongoose";

import {
  isActiveFieldDefinition,
  softDeleteFieldDefinition,
} from "@/models/base/fields";
import {
  baseSchemaOptions,
  type CreateBaseSchemaOptions,
} from "@/models/base/options";
import { softDeletePlugin } from "@/models/base/plugins/soft-delete";

/**
 * Creates a Schema with shared timestamps options and optional soft-delete /
 * isActive foundation fields. Pass only business/domain paths in `definition`.
 *
 * @example
 * ```ts
 * const doctorSchema = createBaseSchema(
 *   { fullName: { type: String, required: true } },
 *   { softDelete: true, isActive: true, collection: "doctors" },
 * );
 * ```
 */
export function createBaseSchema(
  definition: SchemaDefinition,
  options: CreateBaseSchemaOptions = {},
): Schema {
  const {
    softDelete = true,
    isActive = false,
    collection,
    schemaOptions,
  } = options;

  const foundationFields: SchemaDefinition = {
    ...(softDelete ? softDeleteFieldDefinition : {}),
    ...(isActive ? isActiveFieldDefinition : {}),
  };

  const mergedOptions: SchemaOptions = {
    ...baseSchemaOptions,
    ...schemaOptions,
    ...(collection ? { collection } : {}),
  };

  const schema = new Schema(
    {
      ...foundationFields,
      ...definition,
    },
    mergedOptions,
  );

  if (softDelete) {
    schema.plugin(softDeletePlugin);
  }

  return schema;
}
