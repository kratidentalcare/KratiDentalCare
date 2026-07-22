import type { UserRole } from "@/constants/roles";

/**
 * Serializable admin profile DTO for the dashboard profile page.
 */
export type AdminProfileView = {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: UserRole;
  roleLabel: string;
  profileImage: string | null;
  joinedAt: string;
  lastLoginAt: string | null;
};
