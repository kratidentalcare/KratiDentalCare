import {
  USER_ACCESS_STATUSES,
  type UserAccessStatus,
} from "@/constants/user-status";

export function accessStatusFromIsActive(isActive: boolean): UserAccessStatus {
  return isActive
    ? USER_ACCESS_STATUSES.ACTIVE
    : USER_ACCESS_STATUSES.DISABLED;
}

export function isActiveFromAccessStatus(status: UserAccessStatus): boolean {
  return status === USER_ACCESS_STATUSES.ACTIVE;
}

export function mongoAccessStatusFilter(
  filter: "all" | UserAccessStatus,
): Record<string, unknown> | null {
  if (filter === USER_ACCESS_STATUSES.ACTIVE) {
    return { isActive: true };
  }
  if (filter === USER_ACCESS_STATUSES.DISABLED) {
    return { isActive: false };
  }
  return null;
}
