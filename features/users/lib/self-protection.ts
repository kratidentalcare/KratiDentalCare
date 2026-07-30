import type { UserRole } from "@/constants/roles";
import { USER_ROLES } from "@/constants/roles";
import {
  USER_ACCESS_STATUSES,
  type UserAccessStatus,
} from "@/constants/user-status";
import { ForbiddenError } from "@/lib/errors";

/**
 * Prevents an admin from removing their own ADMIN role (lockout protection).
 */
export function assertCanChangeOwnRole(
  actorUserId: string,
  targetUserId: string,
  currentRole: UserRole,
  nextRole: UserRole,
): void {
  if (actorUserId !== targetUserId) {
    return;
  }

  if (
    currentRole === USER_ROLES.ADMIN &&
    nextRole !== USER_ROLES.ADMIN
  ) {
    throw new ForbiddenError(
      "You cannot remove your own Admin role. Ask another admin to change it.",
    );
  }
}

/**
 * Prevents an admin from disabling their own account (lockout protection).
 */
export function assertCanChangeOwnAccessStatus(
  actorUserId: string,
  targetUserId: string,
  nextStatus: UserAccessStatus,
): void {
  if (actorUserId !== targetUserId) {
    return;
  }

  if (nextStatus === USER_ACCESS_STATUSES.DISABLED) {
    throw new ForbiddenError(
      "You cannot disable your own account. Ask another admin to disable it.",
    );
  }
}

export function isSelfTarget(
  actorUserId: string,
  targetUserId: string,
): boolean {
  return actorUserId === targetUserId;
}

export function canChangeRoleInUi(
  actorUserId: string,
  targetUserId: string,
  currentRole: UserRole,
  nextRole: UserRole,
): boolean {
  try {
    assertCanChangeOwnRole(actorUserId, targetUserId, currentRole, nextRole);
    return true;
  } catch {
    return false;
  }
}

export function canDisableInUi(
  actorUserId: string,
  targetUserId: string,
): boolean {
  return !isSelfTarget(actorUserId, targetUserId);
}
