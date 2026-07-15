import "server-only";

import { USER_ROLES, type UserRole } from "@/constants/roles";

/**
 * Fine-grained permission identifiers.
 * Grow this catalog as features ship — roles map to sets of permissions below.
 *
 * Naming: `resource:action` (stable machine strings).
 */
export const PERMISSIONS = {
  // Appointments
  APPOINTMENTS_BOOK: "appointments:book",
  APPOINTMENTS_READ_OWN: "appointments:read_own",
  APPOINTMENTS_READ_ALL: "appointments:read_all",
  APPOINTMENTS_MANAGE: "appointments:manage",

  // Slots
  SLOTS_READ: "slots:read",
  SLOTS_MANAGE: "slots:manage",

  // Prescriptions
  PRESCRIPTIONS_READ_OWN: "prescriptions:read_own",
  PRESCRIPTIONS_READ_ALL: "prescriptions:read_all",
  PRESCRIPTIONS_ISSUE: "prescriptions:issue",
  PRESCRIPTIONS_MANAGE: "prescriptions:manage",

  // Patients / doctors master data
  PATIENTS_READ: "patients:read",
  PATIENTS_MANAGE: "patients:manage",
  DOCTORS_READ: "doctors:read",
  DOCTORS_MANAGE: "doctors:manage",

  // CMS / clinic ops
  WEBSITE_MANAGE: "website:manage",
  CLINIC_SETTINGS_MANAGE: "clinic_settings:manage",

  // Staff dashboards (route-shell access)
  DASHBOARD_ADMIN: "dashboard:admin",
  DASHBOARD_PATIENT: "dashboard:patient",
  DASHBOARD_DOCTOR: "dashboard:doctor",
  DASHBOARD_RECEPTIONIST: "dashboard:receptionist",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ADMIN_PERMISSIONS = [
  PERMISSIONS.APPOINTMENTS_BOOK,
  PERMISSIONS.APPOINTMENTS_READ_OWN,
  PERMISSIONS.APPOINTMENTS_READ_ALL,
  PERMISSIONS.APPOINTMENTS_MANAGE,
  PERMISSIONS.SLOTS_READ,
  PERMISSIONS.SLOTS_MANAGE,
  PERMISSIONS.PRESCRIPTIONS_READ_OWN,
  PERMISSIONS.PRESCRIPTIONS_READ_ALL,
  PERMISSIONS.PRESCRIPTIONS_ISSUE,
  PERMISSIONS.PRESCRIPTIONS_MANAGE,
  PERMISSIONS.PATIENTS_READ,
  PERMISSIONS.PATIENTS_MANAGE,
  PERMISSIONS.DOCTORS_READ,
  PERMISSIONS.DOCTORS_MANAGE,
  PERMISSIONS.WEBSITE_MANAGE,
  PERMISSIONS.CLINIC_SETTINGS_MANAGE,
  PERMISSIONS.DASHBOARD_ADMIN,
] as const satisfies readonly Permission[];

const PATIENT_PERMISSIONS = [
  PERMISSIONS.APPOINTMENTS_BOOK,
  PERMISSIONS.APPOINTMENTS_READ_OWN,
  PERMISSIONS.SLOTS_READ,
  PERMISSIONS.PRESCRIPTIONS_READ_OWN,
  PERMISSIONS.DASHBOARD_PATIENT,
] as const satisfies readonly Permission[];

/** Future clinical portal — reserved grants. */
const DOCTOR_PERMISSIONS = [
  PERMISSIONS.APPOINTMENTS_READ_OWN,
  PERMISSIONS.SLOTS_READ,
  PERMISSIONS.SLOTS_MANAGE,
  PERMISSIONS.PRESCRIPTIONS_READ_OWN,
  PERMISSIONS.PRESCRIPTIONS_ISSUE,
  PERMISSIONS.PATIENTS_READ,
  PERMISSIONS.DASHBOARD_DOCTOR,
] as const satisfies readonly Permission[];

/** Future front-desk portal — reserved grants. */
const RECEPTIONIST_PERMISSIONS = [
  PERMISSIONS.APPOINTMENTS_BOOK,
  PERMISSIONS.APPOINTMENTS_READ_ALL,
  PERMISSIONS.APPOINTMENTS_MANAGE,
  PERMISSIONS.SLOTS_READ,
  PERMISSIONS.PATIENTS_READ,
  PERMISSIONS.PATIENTS_MANAGE,
  PERMISSIONS.DOCTORS_READ,
  PERMISSIONS.DASHBOARD_RECEPTIONIST,
] as const satisfies readonly Permission[];

/** Future limited assist role — deliberately narrow. */
const ASSISTANT_PERMISSIONS = [
  PERMISSIONS.APPOINTMENTS_READ_ALL,
  PERMISSIONS.SLOTS_READ,
  PERMISSIONS.PATIENTS_READ,
] as const satisfies readonly Permission[];

/**
 * Role → permission matrix. Source of truth for capability checks.
 * Adding a role later = add `USER_ROLES` entry + a row here.
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: ADMIN_PERMISSIONS,
  [USER_ROLES.PATIENT]: PATIENT_PERMISSIONS,
  [USER_ROLES.DOCTOR]: DOCTOR_PERMISSIONS,
  [USER_ROLES.RECEPTIONIST]: RECEPTIONIST_PERMISSIONS,
  [USER_ROLES.ASSISTANT]: ASSISTANT_PERMISSIONS,
} as const satisfies Record<UserRole, readonly Permission[]>;

/**
 * Returns the permission set for a role (empty if role is unrecognized).
 */
export function getPermissionsForRole(
  role: UserRole,
): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Pure check: does this role include the permission?
 */
export function roleHasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  return getPermissionsForRole(role).includes(permission);
}

/**
 * Pure check: does this role include every listed permission?
 */
export function roleHasAllPermissions(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => roleHasPermission(role, permission));
}

/**
 * Pure check: does this role include at least one listed permission?
 */
export function roleHasAnyPermission(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => roleHasPermission(role, permission));
}
