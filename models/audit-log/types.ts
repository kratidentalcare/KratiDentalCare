import type { Model, Types } from "mongoose";

import type { UserRole } from "@/constants/roles";
import type { BaseDocument, LeanBaseDocument } from "@/models/base";

import type { AuditAction } from "./actions";

export type AuditLogSnapshot = {
  role?: UserRole;
  isActive?: boolean;
  name?: string;
  type?: string;
  cloudinaryPublicId?: string;
};

export type AuditLogFields = {
  action: AuditAction;
  targetUserId: Types.ObjectId;
  performedByUserId: Types.ObjectId;
  /** Optional patient chart for clinical document audits. */
  patientId: Types.ObjectId | null;
  /** Optional resource id (e.g. patient document id). */
  resourceId: Types.ObjectId | null;
  before: AuditLogSnapshot | null;
  after: AuditLogSnapshot | null;
  /** Optional free-form context for operators / debugging. */
  note: string | null;
};

export type AuditLogDocument = BaseDocument & AuditLogFields;

export type LeanAuditLog = LeanBaseDocument & AuditLogFields;

export type AuditLogModel = Model<AuditLogDocument>;
