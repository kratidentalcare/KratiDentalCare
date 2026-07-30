import type { UserRole } from "@/constants/roles";
import { USER_ROLES } from "@/constants/roles";
import {
  USER_ACCESS_STATUSES,
  type UserAccessStatus,
} from "@/constants/user-status";
import { formatFullName } from "@/features/profile/lib/format";

export function formatUserAccessStatusLabel(
  status: UserAccessStatus,
): string {
  return status === USER_ACCESS_STATUSES.ACTIVE ? "Active" : "Disabled";
}

export function formatUserRoleDisplay(role: UserRole): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return "Admin";
    case USER_ROLES.DOCTOR:
      return "Doctor";
    case USER_ROLES.STAFF:
      return "Staff";
    case USER_ROLES.PATIENT:
      return "Patient";
    default:
      return role;
  }
}

export function buildUserDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  return formatFullName(firstName, lastName, email);
}

export function formatUserDate(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatUserDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
