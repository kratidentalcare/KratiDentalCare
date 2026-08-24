import "server-only";

import { MEDICINE_STATUSES } from "@/constants/statuses";
import { buildMedicineSearchFilter } from "@/features/medicines/lib/list-filter";
import { toMedicineSearchHit } from "@/features/medicines/lib/mappers";
import { searchActiveMedicines } from "@/features/medicines/repositories/medicine-repository";
import type { MedicineSearchHit } from "@/features/medicines/types";
import { connect } from "@/lib/db";
import type { SearchMedicinesQuery } from "@/validators/medicine";

export async function searchMedicines(
  query: SearchMedicinesQuery,
): Promise<MedicineSearchHit[]> {
  await connect();

  const searchFilter = buildMedicineSearchFilter(query.query);
  const filter: Record<string, unknown> = {
    status: MEDICINE_STATUSES.ACTIVE,
    ...(searchFilter ?? {}),
  };

  const items = await searchActiveMedicines(filter, query.limit);
  return items.map(toMedicineSearchHit);
}
