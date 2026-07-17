import "server-only";

import { Types } from "mongoose";

import { PAGINATION } from "@/constants";
import { ConflictError, NotFoundError } from "@/lib/errors";
import {
  Prescription,
  type LeanPrescription,
  type PrescriptionDocument,
} from "@/models/prescription";
import type { PrescriptionListQuery } from "@/validators/prescription";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function duplicateKeyPath(error: unknown): string | null {
  if (
    error !== null &&
    typeof error === "object" &&
    "keyPattern" in error &&
    error.keyPattern &&
    typeof error.keyPattern === "object"
  ) {
    const keys = Object.keys(error.keyPattern as Record<string, unknown>);
    return keys[0] ?? null;
  }
  return null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findPrescriptionById(
  id: string,
): Promise<LeanPrescription | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return Prescription.findOne({
    _id: new Types.ObjectId(id),
    deletedAt: null,
  }).lean<LeanPrescription>();
}

export async function findPrescriptionByIdOrThrow(
  id: string,
): Promise<LeanPrescription> {
  const prescription = await findPrescriptionById(id);
  if (!prescription) {
    throw new NotFoundError("Prescription not found");
  }
  return prescription;
}

export async function findPrescriptionByAppointmentId(
  appointmentId: string,
): Promise<LeanPrescription | null> {
  if (!Types.ObjectId.isValid(appointmentId)) {
    return null;
  }

  return Prescription.findOne({
    appointmentId: new Types.ObjectId(appointmentId),
    deletedAt: null,
  }).lean<LeanPrescription>();
}

export async function listPrescriptions(
  query: PrescriptionListQuery,
): Promise<{ items: LeanPrescription[]; total: number }> {
  const filter: Record<string, unknown> = { deletedAt: null };

  if (query.patientId) {
    filter.patientId = new Types.ObjectId(query.patientId);
  }
  if (query.appointmentId) {
    filter.appointmentId = new Types.ObjectId(query.appointmentId);
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [
      { prescriptionNumber: pattern },
      { "patientSnapshot.fullName": pattern },
      { diagnosis: pattern },
    ];
  }

  const page = query.page ?? PAGINATION.DEFAULT_PAGE;
  const limit = query.limit ?? PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Prescription.find(filter)
      .sort({ issuedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanPrescription[]>(),
    Prescription.countDocuments(filter),
  ]);

  return { items, total };
}

export async function listPrescriptionsForPatient(
  patientId: string,
  page: number,
  limit: number,
): Promise<{ items: LeanPrescription[]; total: number }> {
  return listPrescriptions({ patientId, page, limit });
}

export async function insertPrescription(
  data: Record<string, unknown>,
): Promise<PrescriptionDocument> {
  try {
    const doc = await Prescription.create(data);
    return doc;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const path = duplicateKeyPath(error);
      if (path === "appointmentId") {
        throw new ConflictError(
          "A prescription already exists for this appointment",
        );
      }
      if (path === "prescriptionNumber") {
        throw new ConflictError("Prescription number conflict — please retry");
      }
      throw new ConflictError("Prescription conflict");
    }
    throw error;
  }
}

export async function updatePrescriptionById(
  id: string,
  data: Record<string, unknown>,
): Promise<LeanPrescription> {
  try {
    const updated = await Prescription.findOneAndUpdate(
      { _id: new Types.ObjectId(id), deletedAt: null },
      { $set: data },
      { new: true, runValidators: true },
    ).lean<LeanPrescription>();

    if (!updated) {
      throw new NotFoundError("Prescription not found");
    }

    return updated;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ConflictError(
        "A prescription already exists for this appointment",
      );
    }
    throw error;
  }
}
