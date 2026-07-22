import type { UserRole } from "@/constants/roles";
import { USER_ROLES } from "@/constants/roles";

/**
 * Human-readable role labels for profile display.
 */
export function formatUserRoleLabel(role: UserRole): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return "Admin";
    case USER_ROLES.DOCTOR:
      return "Doctor";
    case USER_ROLES.PATIENT:
      return "Patient";
    case USER_ROLES.RECEPTIONIST:
      return "Receptionist";
    case USER_ROLES.ASSISTANT:
      return "Assistant";
    default:
      return role;
  }
}

/**
 * Join first + last into a single display name.
 */
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback = "",
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
}

/**
 * Split a free-form full name into first / last for Clerk + Mongo.
 */
export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string | null;
} {
  const normalized = fullName.trim().replace(/\s+/g, " ");
  const spaceIndex = normalized.indexOf(" ");

  if (spaceIndex === -1) {
    return { firstName: normalized, lastName: null };
  }

  return {
    firstName: normalized.slice(0, spaceIndex),
    lastName: normalized.slice(spaceIndex + 1) || null,
  };
}

/**
 * Locale-friendly date/time for profile metadata.
 */
export function formatProfileDateTime(
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

export function formatProfileDate(
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
