import "server-only";

/**
 * Shared Mongoose foundation for all future domain models.
 * Contains no business collections or application logic.
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

export type {
  ActiveFlagFields,
  ActivatableDocument,
  BaseDocument,
  BaseDocumentFields,
  SoftActivatableDocument,
  SoftDeleteDocument,
  SoftDeleteFields,
  SoftDeleteMethods,
  TimestampFields,
} from "./types";
