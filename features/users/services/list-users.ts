import "server-only";

import { PAGINATION } from "@/constants";
import { buildUserDisplayName } from "@/features/users/lib/format";
import { accessStatusFromIsActive } from "@/features/users/lib/status";
import {
  buildUserListFilter,
  listUserDocuments,
} from "@/features/users/repositories/user-repository";
import type { UserListItem, UserListResult } from "@/features/users/types";
import { connect } from "@/lib/db";
import { buildPaginationMeta } from "@/types/pagination";
import type { UserListQuery } from "@/validators/user-management";

export async function listUsers(
  query: UserListQuery,
): Promise<UserListResult> {
  await connect();

  const page = query.page ?? PAGINATION.DEFAULT_PAGE;
  const limit = query.limit ?? PAGINATION.DEFAULT_LIMIT;
  const filter = buildUserListFilter(query);

  const { items, total } = await listUserDocuments(filter, page, limit);

  const mapped: UserListItem[] = items.map((user) => ({
    id: String(user._id),
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: buildUserDisplayName(user.firstName, user.lastName, user.email),
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: accessStatusFromIsActive(user.isActive),
    isActive: user.isActive,
    profileImage: user.profileImage,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  }));

  const pagination = buildPaginationMeta(page, limit, total);
  const totalPages = Math.max(1, pagination.totalPages);

  return {
    items: mapped,
    pagination: {
      ...pagination,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
