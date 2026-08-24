import "server-only";

import type { LeanMedicine } from "@/models/medicine";
import type {
  MedicineListItem,
  MedicineSearchHit,
} from "@/features/medicines/types";

export function toMedicineListItem(doc: LeanMedicine): MedicineListItem {
  return {
    id: String(doc._id),
    name: doc.name,
    genericName: doc.genericName,
    dosage: doc.dosage,
    frequency: doc.frequency,
    duration: doc.duration,
    instructions: doc.instructions,
    notes: doc.notes,
    status: doc.status,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export function toMedicineSearchHit(doc: LeanMedicine): MedicineSearchHit {
  return {
    id: String(doc._id),
    name: doc.name,
    genericName: doc.genericName,
    dosage: doc.dosage,
    frequency: doc.frequency,
    duration: doc.duration,
    instructions: doc.instructions,
  };
}
