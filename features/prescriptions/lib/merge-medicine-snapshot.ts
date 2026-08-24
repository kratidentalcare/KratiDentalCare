import { Types } from "mongoose";

import type { PrescriptionFormInput } from "@/validators/prescription";

export type CatalogMedicineSnapshot = {
  id: string;
  genericName: string | null;
};

export type PrescriptionMedicationSnapshot = {
  medicineId: Types.ObjectId | null;
  name: string;
  genericName: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  route: null;
  instructions: string | null;
  quantity: null;
};

/**
 * Build the embedded prescription snapshot from validated form values.
 * Catalog lookup only verifies `medicineId` provenance — doctor-edited
 * dosage/frequency/duration/instructions/name are never overwritten.
 */
export function mergeMedicineSnapshot(
  form: PrescriptionFormInput["medications"][number],
  catalog: CatalogMedicineSnapshot | null,
): PrescriptionMedicationSnapshot {
  const catalogId =
    form.medicineId && catalog && catalog.id === form.medicineId
      ? form.medicineId
      : null;

  return {
    medicineId: catalogId ? new Types.ObjectId(catalogId) : null,
    name: form.medicineName,
    genericName: form.genericName ?? catalog?.genericName ?? null,
    dosage: form.dosage,
    frequency: form.frequency,
    duration: form.duration,
    route: null,
    instructions: form.instructions ?? null,
    quantity: null,
  };
}
