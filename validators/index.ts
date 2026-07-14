/**
 * Shared Zod primitives and enum schemas.
 * Feature-specific schemas live alongside features in later phases.
 */

export {
  appointmentStatusSchema,
  contentStatusSchema,
  doctorStatusSchema,
  emailSchema,
  isoDateStringSchema,
  nonEmptyStringSchema,
  objectIdSchema,
  patientStatusSchema,
  phoneSchema,
  prescriptionStatusSchema,
  slotStatusSchema,
  userRoleSchema,
} from "./common";

export {
  paginationQuerySchema,
  type PaginationQuery,
} from "./pagination";
