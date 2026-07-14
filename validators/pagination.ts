import { z } from "zod";

import { PAGINATION } from "@/constants";

/**
 * Shared list query schema (page, limit, sort, search).
 * Resource-specific filters are composed in feature validators later.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(PAGINATION.MIN_PAGE)
    .default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(PAGINATION.MIN_LIMIT)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  sort: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).max(200).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
