import type { UserRole } from "@/constants/roles";
import type { UserAccessStatus } from "@/constants/user-status";
import type { PaginationMeta } from "@/types/api";

/** List-row DTO for Dashboard → Users. */
export type UserListItem = {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  phoneNumber: string | null;
  role: UserRole;
  status: UserAccessStatus;
  isActive: boolean;
  profileImage: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type UserListResult = {
  items: UserListItem[];
  pagination: PaginationMeta & {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

/** Detail DTO for the user drawer. */
export type UserDetail = UserListItem & {
  emailVerified: boolean;
  phoneVerified: boolean;
  updatedAt: string;
};

export type UserRoleUpdateResult = {
  id: string;
  role: UserRole;
  previousRole: UserRole;
};

export type UserAccessStatusUpdateResult = {
  id: string;
  status: UserAccessStatus;
  isActive: boolean;
  previousStatus: UserAccessStatus;
};
