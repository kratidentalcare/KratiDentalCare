import { MEDICINE_STATUSES } from "@/constants/statuses";
import { normalizeMedicineName } from "@/features/medicines/lib/normalize-name";
import { Medicine } from "@/models/medicine";

import { SEED_MEDICINES } from "../data/medicines";
import type { SeedContext } from "../lib/context";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

export async function seedMedicines(ctx: SeedContext): Promise<void> {
  for (const medicine of SEED_MEDICINES) {
    const normalizedName = normalizeMedicineName(medicine.name);
    await upsertOne(
      Medicine,
      {
        normalizedName,
        deletedAt: null,
      },
      {
        name: medicine.name,
        genericName: medicine.genericName,
        normalizedName,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        duration: medicine.duration,
        instructions: medicine.instructions,
        notes: null,
        status: MEDICINE_STATUSES.ACTIVE,
        createdByUserId: ctx.admin._id,
        updatedByUserId: ctx.admin._id,
      },
    );
  }

  logOk(`Medicines Seeded (${SEED_MEDICINES.length})`);
}
