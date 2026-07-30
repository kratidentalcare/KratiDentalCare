import "server-only";

import { getOrCreateModel } from "@/models/base";

import { AUDIT_LOG_MODEL_NAME, auditLogSchema } from "./schema";
import type { AuditLogDocument, AuditLogModel } from "./types";

/**
 * AuditLog model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const AuditLog = getOrCreateModel<AuditLogDocument>(
  AUDIT_LOG_MODEL_NAME,
  auditLogSchema,
) as AuditLogModel;

export type {
  AuditLogDocument,
  AuditLogFields,
  AuditLogModel,
  AuditLogSnapshot,
  LeanAuditLog,
} from "./types";
export type { AuditAction } from "./actions";
export { AUDIT_ACTIONS, AUDIT_ACTION_VALUES } from "./actions";
export { AUDIT_LOG_MODEL_NAME, auditLogSchema } from "./schema";
