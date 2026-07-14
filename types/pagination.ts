/**
 * Normalized list query inputs after Zod parse.
 */
export type PaginationInput = {
  page: number;
  limit: number;
  sort?: string;
  search?: string;
};

/**
 * Helper to build pagination meta from count queries.
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return { page, limit, total, totalPages };
}

/**
 * Mongo skip/limit derived from page/limit.
 */
export function getPaginationSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
