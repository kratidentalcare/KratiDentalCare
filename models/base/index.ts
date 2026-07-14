import "server-only";

/**
 * Shared Mongoose foundation for all future domain models.
 * Contains no business collections or application logic.
 *
 * @see docs/04-database-design.md §B
 * @see docs/03-system-architecture.md §12
 */

export {
  isActiveFieldDefinition,
  softDeleteFieldDefinition,
} from "./fields";

export {
  baseSchemaOptions,
  type CreateBaseSchemaOptions,
} from "./options";

export { createBaseSchema } from "./create-schema";

export {
  getOrCreateModel,
  registerModel,
  type InferModelType,
} from "./create-model";

export { softDeletePlugin } from "./plugins";

export {
  TIMESTAMP_FIELD_NAMES,
  TIMESTAMP_SCHEMA_OPTIONS,
} from "./timestamps";

export {
  activeFilter,
  activeNotDeletedFilter,
  notDeletedFilter,
  onlyDeletedFilter,
  withActiveNotDeletedFilter,
  withNotDeletedFilter,
} from "./query-filters";

export {
  OBJECT_ID_VALIDATOR_MESSAGE,
  isValidObjectId,
  objectIdPathValidator,
  toObjectId,
} from "./validators";

export type {
  ActiveFlagFields,
  ActivatableDocument,
  BaseDocument,
  BaseDocumentFields,
  LeanBaseDocument,
  LeanSoftActivatableDocument,
  LeanSoftDeleteDocument,
  SoftActivatableDocument,
  SoftDeleteDocument,
  SoftDeleteFields,
  SoftDeleteMethods,
  SoftDeleteQueryHelpers,
  TimestampFields,
} from "./types";
