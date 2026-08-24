import "server-only";

import { PAGINATION } from "@/constants";
import { buildMedicineListFilter } from "@/features/medicines/lib/list-filter";
import { toMedicineListItem } from "@/features/medicines/lib/mappers";
import { listMedicineDocuments } from "@/features/medicines/repositories/medicine-repository";
import type { MedicineListResult } from "@/features/medicines/types";
import { connect } from "@/lib/db";
import { buildPaginationMeta } from "@/types/pagination";
import type { MedicineListQuery } from "@/validators/medicine";

export async function listMedicines(
  query: MedicineListQuery,
): Promise<MedicineListResult> {
  await connect();

  const page = query.page ?? PAGINATION.DEFAULT_PAGE;
  const limit = query.limit ?? PAGINATION.DEFAULT_LIMIT;
  const filter = buildMedicineListFilter(query);

  const { items, total } = await listMedicineDocuments(filter, page, limit);
  const pagination = buildPaginationMeta(page, limit, total);
  const totalPages = Math.max(1, pagination.totalPages);

  return {
    items: items.map(toMedicineListItem),
    pagination: {
      ...pagination,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
