import "server-only";

import type { ClientSession, Types } from "mongoose";

import {
  AuditLog,
  type AuditAction,
  type AuditLogSnapshot,
} from "@/models/audit-log";

type WriteAuditLogInput = {
  action: AuditAction;
  targetUserId: Types.ObjectId | string;
  performedByUserId: Types.ObjectId | string;
  patientId?: Types.ObjectId | string | null;
  resourceId?: Types.ObjectId | string | null;
  before?: AuditLogSnapshot | null;
  after?: AuditLogSnapshot | null;
  note?: string | null;
};

export async function writeAuditLog(
  input: WriteAuditLogInput,
  session?: ClientSession,
): Promise<void> {
  await AuditLog.create(
    [
      {
        action: input.action,
        targetUserId: input.targetUserId,
        performedByUserId: input.performedByUserId,
        patientId: input.patientId ?? null,
        resourceId: input.resourceId ?? null,
        before: input.before ?? null,
        after: input.after ?? null,
        note: input.note ?? null,
      },
    ],
    session ? { session } : undefined,
  );
}
