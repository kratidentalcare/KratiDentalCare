import "server-only";

import type { FilterQuery } from "mongoose";

import { PAGINATION } from "@/constants";
import { CONTACT_MESSAGE_STATUSES } from "@/constants/statuses";
import { toContactMessageListItem } from "@/features/contact/services/mappers";
import type { ContactMessageListResult } from "@/features/contact/types";
import { connect } from "@/lib/db";
import {
  ContactMessage,
  type ContactMessageDocument,
  type LeanContactMessage,
} from "@/models/contact-message";
import {
  buildPaginationMeta,
  getPaginationSkip,
} from "@/types/pagination";
import type { ContactMessageListQuery } from "@/validators/contact-message";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildListFilter(
  query: ContactMessageListQuery,
): FilterQuery<ContactMessageDocument> {
  const filter: FilterQuery<ContactMessageDocument> = {};

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  const search = query.search?.trim();
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { name: pattern },
      { email: pattern },
      { phone: pattern },
      { subject: pattern },
      { message: pattern },
    ];
  }

  return filter;
}

/**
 * Admin Inbox — paginated inquiries, newest first.
 * Soft-deleted rows are excluded by the model plugin.
 */
export async function listContactMessages(
  query: ContactMessageListQuery,
): Promise<ContactMessageListResult> {
  await connect();

  const page = query.page ?? PAGINATION.DEFAULT_PAGE;
  const limit = query.limit ?? PAGINATION.DEFAULT_LIMIT;
  const filter = buildListFilter(query);

  const [rows, total] = await Promise.all([
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(getPaginationSkip(page, limit))
      .limit(limit)
      .lean<LeanContactMessage[]>(),
    ContactMessage.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);
  const totalPages = Math.max(1, pagination.totalPages);

  return {
    items: rows.map(toContactMessageListItem),
    pagination: {
      ...pagination,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Unread count for sidebar badge — status NEW only.
 */
export async function countUnreadContactMessages(): Promise<number> {
  await connect();

  return ContactMessage.countDocuments({
    status: CONTACT_MESSAGE_STATUSES.NEW,
  });
}
