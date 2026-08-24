import "server-only";

import { Types } from "mongoose";

import { toMedicineListItem } from "@/features/medicines/lib/mappers";
import { assertMedicineNameAvailable } from "@/features/medicines/services/create-medicine";
import { findMedicineByIdOrThrow } from "@/features/medicines/repositories/medicine-repository";
import type { MedicineListItem } from "@/features/medicines/types";
import { connect } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { Medicine, type LeanMedicine } from "@/models/medicine";
import {
  updateMedicineActionSchema,
  type UpdateMedicineActionInput,
} from "@/validators/medicine";

export async function updateMedicine(
  id: string,
  input: UpdateMedicineActionInput,
  actorUserId: string,
): Promise<MedicineListItem> {
  await connect();

  const parsed = updateMedicineActionSchema.safeParse(input);
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

  await findMedicineByIdOrThrow(id);
  const normalizedName = await assertMedicineNameAvailable(
    parsed.data.name,
    id,
  );

  const updated = await Medicine.findOneAndUpdate(
    { _id: new Types.ObjectId(id), deletedAt: null },
    {
      $set: {
        name: parsed.data.name,
        genericName: parsed.data.genericName ?? null,
        normalizedName,
        dosage: parsed.data.dosage,
        frequency: parsed.data.frequency,
        duration: parsed.data.duration,
        instructions: parsed.data.instructions ?? null,
        notes: parsed.data.notes ?? null,
        updatedByUserId: new Types.ObjectId(actorUserId),
      },
    },
    { new: true, runValidators: true },
  ).lean<LeanMedicine>();

  if (!updated) {
    throw new NotFoundError("Medicine not found");
  }

  return toMedicineListItem(updated);
}
