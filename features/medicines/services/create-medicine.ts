import "server-only";

import { Types } from "mongoose";

import { MEDICINE_STATUSES } from "@/constants/statuses";
import { normalizeMedicineName } from "@/features/medicines/lib/normalize-name";
import { toMedicineListItem } from "@/features/medicines/lib/mappers";
import { findMedicineByNormalizedName } from "@/features/medicines/repositories/medicine-repository";
import type { MedicineListItem } from "@/features/medicines/types";
import { connect } from "@/lib/db";
import { ConflictError, ValidationError } from "@/lib/errors";
import { Medicine, type LeanMedicine } from "@/models/medicine";
import {
  createMedicineActionSchema,
  type CreateMedicineActionInput,
} from "@/validators/medicine";

export async function assertMedicineNameAvailable(
  name: string,
  excludeId?: string,
): Promise<string> {
  const normalizedName = normalizeMedicineName(name);
  const existing = await findMedicineByNormalizedName(
    normalizedName,
    excludeId,
  );

  if (!existing) {
    return normalizedName;
  }

  if (existing.status === MEDICINE_STATUSES.ARCHIVED) {
    throw new ConflictError(
      "An archived medicine with this name already exists. Restore it instead.",
    );
  }

  throw new ConflictError("A medicine with this name already exists.");
}

export async function createMedicine(
  input: CreateMedicineActionInput,
  actorUserId: string,
): Promise<MedicineListItem> {
  await connect();

  const parsed = createMedicineActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid medicine",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  if (!Types.ObjectId.isValid(actorUserId)) {
    throw new ValidationError("Invalid user id");
  }

  const normalizedName = await assertMedicineNameAvailable(parsed.data.name);
  const actorId = new Types.ObjectId(actorUserId);

  const created = await Medicine.create({
    name: parsed.data.name,
    genericName: parsed.data.genericName ?? null,
    normalizedName,
    dosage: parsed.data.dosage,
    frequency: parsed.data.frequency,
    duration: parsed.data.duration,
    instructions: parsed.data.instructions ?? null,
    notes: parsed.data.notes ?? null,
    status: MEDICINE_STATUSES.ACTIVE,
    createdByUserId: actorId,
    updatedByUserId: actorId,
  });

  return toMedicineListItem(created.toObject() as LeanMedicine);
}
