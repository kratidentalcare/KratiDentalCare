import "server-only";

import { Types } from "mongoose";

import { MEDICINE_STATUSES } from "@/constants/statuses";
import { toMedicineListItem } from "@/features/medicines/lib/mappers";
import { findMedicineByIdOrThrow } from "@/features/medicines/repositories/medicine-repository";
import type { MedicineListItem } from "@/features/medicines/types";
import { connect } from "@/lib/db";
import { DomainError, NotFoundError, ValidationError } from "@/lib/errors";
import { ERROR_CODES } from "@/constants/error-codes";
import { Medicine, type LeanMedicine } from "@/models/medicine";

async function setMedicineStatus(
  id: string,
  status: (typeof MEDICINE_STATUSES)[keyof typeof MEDICINE_STATUSES],
  actorUserId: string,
): Promise<MedicineListItem> {
  await connect();

  if (!Types.ObjectId.isValid(actorUserId)) {
    throw new ValidationError("Invalid user id");
  }

  const existing = await findMedicineByIdOrThrow(id);
  if (existing.status === status) {
    return toMedicineListItem(existing);
  }

  const updated = await Medicine.findOneAndUpdate(
    { _id: new Types.ObjectId(id), deletedAt: null },
    {
      $set: {
        status,
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

export async function archiveMedicine(
  id: string,
  actorUserId: string,
): Promise<MedicineListItem> {
  await connect();
  const existing = await findMedicineByIdOrThrow(id);
  if (existing.status === MEDICINE_STATUSES.ARCHIVED) {
    throw new DomainError(
      ERROR_CODES.VALIDATION_ERROR,
      "Medicine is already archived",
    );
  }
  return setMedicineStatus(id, MEDICINE_STATUSES.ARCHIVED, actorUserId);
}

export async function restoreMedicine(
  id: string,
  actorUserId: string,
): Promise<MedicineListItem> {
  await connect();
  const existing = await findMedicineByIdOrThrow(id);
  if (existing.status === MEDICINE_STATUSES.ACTIVE) {
    throw new DomainError(
      ERROR_CODES.VALIDATION_ERROR,
      "Medicine is already active",
    );
  }
  return setMedicineStatus(id, MEDICINE_STATUSES.ACTIVE, actorUserId);
}
