import "server-only";

import mongoose from "mongoose";

import { assertCanChangeOwnAccessStatus } from "@/features/users/lib/self-protection";
import {
  accessStatusFromIsActive,
  isActiveFromAccessStatus,
} from "@/features/users/lib/status";
import {
  findUserByIdOrThrow,
  updateUserAccessRecord,
} from "@/features/users/repositories/user-repository";
import { writeAuditLog } from "@/features/users/services/write-audit-log";
import type { UserAccessStatusUpdateResult } from "@/features/users/types";
import { connect } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/models/audit-log";
import type { UpdateUserAccessStatusInput } from "@/validators/user-management";

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

async function applyAccessStatusChange(
  actorUserId: string,
  input: UpdateUserAccessStatusInput,
  session?: mongoose.ClientSession,
): Promise<UserAccessStatusUpdateResult> {
  const target = await findUserByIdOrThrow(input.userId, session);
  const previousStatus = accessStatusFromIsActive(target.isActive);

  assertCanChangeOwnAccessStatus(
    actorUserId,
    String(target._id),
    input.status,
  );

  if (previousStatus === input.status) {
    return {
      id: String(target._id),
      status: previousStatus,
      isActive: target.isActive,
      previousStatus,
    };
  }

  const nextIsActive = isActiveFromAccessStatus(input.status);
  const updated = await updateUserAccessRecord(
    input.userId,
    nextIsActive,
    session,
  );

  await writeAuditLog(
    {
      action: nextIsActive
        ? AUDIT_ACTIONS.USER_ENABLED
        : AUDIT_ACTIONS.USER_DISABLED,
      targetUserId: target._id,
      performedByUserId: actorUserId,
      before: { isActive: target.isActive },
      after: { isActive: updated.isActive },
    },
    session,
  );

  return {
    id: String(updated._id),
    status: accessStatusFromIsActive(updated.isActive),
    isActive: updated.isActive,
    previousStatus,
  };
}

/**
 * Enables or disables dashboard access without deleting the user.
 */
export async function updateUserAccessStatus(
  actorUserId: string,
  input: UpdateUserAccessStatusInput,
): Promise<UserAccessStatusUpdateResult> {
  await connect();

  const session = await mongoose.startSession();
  try {
    let result: UserAccessStatusUpdateResult | null = null;

    try {
      await session.withTransaction(async () => {
        result = await applyAccessStatusChange(actorUserId, input, session);
      });
    } catch (error) {
      if (!isTransactionUnsupportedError(error)) {
        throw error;
      }
      result = await applyAccessStatusChange(actorUserId, input);
    }

    if (!result) {
      throw new Error("Unable to update user access status");
    }

    return result;
  } finally {
    await session.endSession();
  }
}
