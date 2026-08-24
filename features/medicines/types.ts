import type { MedicineStatus } from "@/constants/statuses";
import type { PaginationMeta } from "@/types/api";

/** Admin list-row DTO for Dashboard → Medicines. */
export type MedicineListItem = {
  id: string;
  name: string;
  genericName: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  notes: string | null;
  status: MedicineStatus;
  createdAt: string;
  updatedAt: string;
};

export type MedicineListResult = {
  items: MedicineListItem[];
  pagination: PaginationMeta & {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

/** Compact catalog row for the prescription autocomplete. */
export type MedicineSearchHit = {
  id: string;
  name: string;
  genericName: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
};
