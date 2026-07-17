import "server-only";

import { PAGINATION } from "@/constants";
import { mapPrescriptionListItem } from "@/features/prescriptions/lib/map-prescription";
import { listPrescriptions } from "@/features/prescriptions/repositories/prescription-repository";
import type { PrescriptionListResult } from "@/features/prescriptions/types";
import { connect } from "@/lib/db";
import { buildPaginationMeta } from "@/types/pagination";
import type { PrescriptionListQuery } from "@/validators/prescription";

export async function listPrescriptionsService(
  query: PrescriptionListQuery,
): Promise<PrescriptionListResult> {
  await connect();

  const page = query.page ?? PAGINATION.DEFAULT_PAGE;
  const limit = query.limit ?? PAGINATION.DEFAULT_LIMIT;
  const { items, total } = await listPrescriptions({
    ...query,
    page,
    limit,
  });

  const pagination = buildPaginationMeta(page, limit, total);
  const totalPages = Math.max(1, pagination.totalPages);

  return {
    items: items.map(mapPrescriptionListItem),
    pagination: {
      ...pagination,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
