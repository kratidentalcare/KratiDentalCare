import {
  escapeRegex,
  phoneSearchDigits,
} from "@/features/users/lib/search";
import { mongoAccessStatusFilter } from "@/features/users/lib/status";
import type { UserListQuery } from "@/validators/user-management";

export function buildUserSearchFilter(
  search: string | undefined,
): Record<string, unknown> | null {
  if (!search) {
    return null;
  }

  const pattern = new RegExp(escapeRegex(search), "i");
  const or: Record<string, unknown>[] = [
    { firstName: pattern },
    { lastName: pattern },
    { email: pattern },
    { phoneNumber: pattern },
  ];

  const digits = phoneSearchDigits(search);
  if (digits) {
    or.push({ phoneNumber: new RegExp(escapeRegex(digits)) });
  }

  return { $or: or };
}

export function buildUserListFilter(
  query: Pick<UserListQuery, "search" | "role" | "status">,
): Record<string, unknown> {
  const filter: Record<string, unknown> = { deletedAt: null };

  if (query.role !== "all") {
    filter.role = query.role;
  }

  const statusFilter = mongoAccessStatusFilter(query.status);
  if (statusFilter) {
    Object.assign(filter, statusFilter);
  }

  const searchFilter = buildUserSearchFilter(query.search);
  if (searchFilter) {
    Object.assign(filter, searchFilter);
  }

  return filter;
}
