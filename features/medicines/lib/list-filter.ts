import { MEDICINE_STATUSES } from "@/constants/statuses";
import { escapeRegex } from "@/features/medicines/lib/search";
import type { MedicineListQuery } from "@/validators/medicine";

export function buildMedicineSearchFilter(
  search: string | undefined,
): Record<string, unknown> | null {
  if (!search) {
    return null;
  }

  const pattern = new RegExp(escapeRegex(search), "i");
  return {
    $or: [{ name: pattern }, { genericName: pattern }],
  };
}

export function buildMedicineListFilter(
  query: Pick<MedicineListQuery, "search" | "status">,
): Record<string, unknown> {
  const filter: Record<string, unknown> = { deletedAt: null };

  if (query.status === MEDICINE_STATUSES.ACTIVE) {
    filter.status = MEDICINE_STATUSES.ACTIVE;
  } else if (query.status === MEDICINE_STATUSES.ARCHIVED) {
    filter.status = MEDICINE_STATUSES.ARCHIVED;
  }

  const searchFilter = buildMedicineSearchFilter(query.search);
  if (searchFilter) {
    Object.assign(filter, searchFilter);
  }

  return filter;
}
