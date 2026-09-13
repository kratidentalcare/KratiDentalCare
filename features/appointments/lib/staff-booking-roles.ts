import { USER_ROLES, type UserRole } from "@/constants/roles";

const STAFF_BOOKING_ROLES: readonly UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.DOCTOR,
  USER_ROLES.STAFF,
];

/** Roles allowed to create dashboard bookings (mirrors appointments:create_staff). */
export function canCreateStaffAppointment(role: UserRole): boolean {
  return STAFF_BOOKING_ROLES.includes(role);
}
