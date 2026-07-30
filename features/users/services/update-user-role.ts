import "server-only";

import mongoose from "mongoose";

import { USER_ROLES } from "@/constants/roles";
import { assertCanChangeOwnRole } from "@/features/users/lib/self-protection";
import {
  findUserByIdOrThrow,
  updateUserRoleRecord,
} from "@/features/users/repositories/user-repository";
import { writeAuditLog } from "@/features/users/services/write-audit-log";
import type { UserRoleUpdateResult } from "@/features/users/types";
import { connect } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/models/audit-log";
import type { UpdateUserRoleInput } from "@/validators/user-management";

function isTransactionUnsupportedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("transaction numbers are only allowed") ||
    message.includes("transactions are not supported") ||
    message.includes("replica set")
  );
}

async function applyRoleChange(
  actorUserId: string,
  input: UpdateUserRoleInput,
  session?: mongoose.ClientSession,
): Promise<UserRoleUpdateResult> {
  const target = await findUserByIdOrThrow(input.userId, session);

  assertCanChangeOwnRole(
    actorUserId,
    String(target._id),
    target.role,
    input.role,
  );

  if (target.role === input.role) {
    return {
      id: String(target._id),
      role: target.role,
      previousRole: target.role,
    };
  }

  const updated = await updateUserRoleRecord(input.userId, input.role, session);

  await writeAuditLog(
    {
      action: AUDIT_ACTIONS.ROLE_CHANGED,
      targetUserId: target._id,
      performedByUserId: actorUserId,
      before: { role: target.role },
      after: { role: updated.role },
      note:
        target.role === USER_ROLES.ADMIN || input.role === USER_ROLES.ADMIN
          ? "Admin role mutation"
          : null,
    },
    session,
  );

  return {
    id: String(updated._id),
    role: updated.role,
    previousRole: target.role,
  };
}

/**
 * Changes a user's role with self-demotion protection and audit logging.
 */
export async function updateUserRole(
  actorUserId: string,
  input: UpdateUserRoleInput,
): Promise<UserRoleUpdateResult> {
  await connect();

  const session = await mongoose.startSession();
  try {
    let result: UserRoleUpdateResult | null = null;

    try {
      await session.withTransaction(async () => {
        result = await applyRoleChange(actorUserId, input, session);
      });
    } catch (error) {
      if (!isTransactionUnsupportedError(error)) {
        throw error;
      }
      result = await applyRoleChange(actorUserId, input);
    }

    if (!result) {
      throw new Error("Unable to update user role");
    }

    return result;
  } finally {
    await session.endSession();
  }
}
