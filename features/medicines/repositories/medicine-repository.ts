import "server-only";

import { Types } from "mongoose";

import { MEDICINE_STATUSES } from "@/constants/statuses";
import { NotFoundError } from "@/lib/errors";
import { Medicine, type LeanMedicine } from "@/models/medicine";

export {
  buildMedicineListFilter,
  buildMedicineSearchFilter,
} from "@/features/medicines/lib/list-filter";

export async function findMedicineById(
  id: string,
): Promise<LeanMedicine | null> {
  return Medicine.findOne({
    _id: new Types.ObjectId(id),
    deletedAt: null,
  }).lean<LeanMedicine>();
}

export async function findMedicineByIdOrThrow(
  id: string,
): Promise<LeanMedicine> {
  const medicine = await findMedicineById(id);
  if (!medicine) {
    throw new NotFoundError("Medicine not found");
  }
  return medicine;
}

export async function findMedicineByNormalizedName(
  normalizedName: string,
  excludeId?: string,
): Promise<LeanMedicine | null> {
  const filter: Record<string, unknown> = {
    normalizedName,
    deletedAt: null,
  };
  if (excludeId) {
    filter._id = { $ne: new Types.ObjectId(excludeId) };
  }
  return Medicine.findOne(filter).lean<LeanMedicine>();
}

export async function listMedicineDocuments(
  filter: Record<string, unknown>,
  page: number,
  limit: number,
): Promise<{ items: LeanMedicine[]; total: number }> {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Medicine.find(filter)
      .sort({ updatedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanMedicine[]>(),
    Medicine.countDocuments(filter),
  ]);

  return { items, total };
}

export async function searchActiveMedicines(
  filter: Record<string, unknown>,
  limit: number,
): Promise<LeanMedicine[]> {
  return Medicine.find({
    ...filter,
    deletedAt: null,
    status: MEDICINE_STATUSES.ACTIVE,
  })
    .sort({ name: 1, _id: 1 })
    .limit(limit)
    .lean<LeanMedicine[]>();
}

export async function findMedicinesByIds(
  ids: string[],
): Promise<LeanMedicine[]> {
  if (ids.length === 0) {
    return [];
  }

  return Medicine.find({
    _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    deletedAt: null,
  }).lean<LeanMedicine[]>();
}
