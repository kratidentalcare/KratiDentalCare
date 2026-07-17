import "server-only";

import type { ClientSession, Types } from "mongoose";
import { Types as MongooseTypes } from "mongoose";

import { PATIENT_STATUSES } from "@/constants/statuses";
import {
  escapeRegex,
  normalizePhone,
  phoneSearchDigits,
  toDisplayPhone,
} from "@/features/patients/lib/phone";
import { mongoStatusFilter } from "@/features/patients/lib/status";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { Patient, type LeanPatient } from "@/models/patient";
import type { PatientListQuery } from "@/validators/patient";

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

export function buildPatientSearchFilter(
  search: string | undefined,
): Record<string, unknown> | null {
  if (!search) {
    return null;
  }

  const pattern = new RegExp(escapeRegex(search), "i");
  const or: Record<string, unknown>[] = [
    { fullName: pattern },
    { email: pattern },
    { phone: pattern },
  ];

  const digits = phoneSearchDigits(search);
  if (digits) {
    or.push({ canonicalPhone: new RegExp(escapeRegex(digits)) });
    or.push({ phone: new RegExp(escapeRegex(digits)) });
  }

  return { $or: or };
}

export function buildPatientListFilter(
  query: Pick<PatientListQuery, "search" | "status">,
): Record<string, unknown> {
  const filter: Record<string, unknown> = { deletedAt: null };
  const statusFilter = mongoStatusFilter(query.status);
  if (statusFilter) {
    Object.assign(filter, statusFilter);
  }

  const searchFilter = buildPatientSearchFilter(query.search);
  if (searchFilter) {
    Object.assign(filter, searchFilter);
  }

  return filter;
}

export async function findPatientById(
  id: string,
  session?: ClientSession,
): Promise<LeanPatient | null> {
  const query = Patient.findOne({
    _id: new MongooseTypes.ObjectId(id),
    deletedAt: null,
  });
  if (session) {
    query.session(session);
  }
  return query.lean<LeanPatient>();
}

export async function findPatientByIdOrThrow(
  id: string,
  session?: ClientSession,
): Promise<LeanPatient> {
  const patient = await findPatientById(id, session);
  if (!patient) {
    throw new NotFoundError("Patient not found");
  }
  return patient;
}

/**
 * Locates a patient by canonical phone, with legacy phone fallbacks.
 * Throws when multiple active charts collide on the same identity.
 */
export async function findPatientsByPhoneIdentity(
  phone: string,
  session?: ClientSession,
): Promise<LeanPatient[]> {
  const canonicalPhone = normalizePhone(phone);
  const displayPhone = toDisplayPhone(phone);
  const compactPhone = phone.replace(/\s+/g, "").trim();

  const query = Patient.find({
    deletedAt: null,
    $or: [
      { canonicalPhone },
      { phone: displayPhone },
      { phone: compactPhone },
      { phone: canonicalPhone },
    ],
  }).sort({ createdAt: 1 });

  if (session) {
    query.session(session);
  }

  const matches = await query.lean<LeanPatient[]>();
  if (matches.length <= 1) {
    return matches;
  }

  const sameIdentity = matches.filter((patient) => {
    const existingCanonical =
      patient.canonicalPhone || normalizePhone(patient.phone);
    return existingCanonical === canonicalPhone;
  });

  if (sameIdentity.length > 1) {
    throw new ConflictError(
      "Multiple patient records share this phone number. Resolve duplicates before booking.",
    );
  }

  return sameIdentity.length === 1 ? sameIdentity : matches.slice(0, 1);
}

export async function findPatientByEmailExcludingId(
  email: string,
  excludeId: Types.ObjectId | string,
  session?: ClientSession,
): Promise<LeanPatient | null> {
  const query = Patient.findOne({
    email: email.toLowerCase(),
    deletedAt: null,
    _id: { $ne: new MongooseTypes.ObjectId(String(excludeId)) },
  });
  if (session) {
    query.session(session);
  }
  return query.lean<LeanPatient>();
}

export async function createPatientRecord(
  input: {
    fullName: string;
    phone: string;
    email: string | null;
  },
  session?: ClientSession,
): Promise<LeanPatient> {
  const displayPhone = toDisplayPhone(input.phone);
  const canonicalPhone = normalizePhone(input.phone);

  try {
    const [created] = await Patient.create(
      [
        {
          fullName: input.fullName.trim(),
          phone: displayPhone,
          canonicalPhone,
          email: input.email,
          status: PATIENT_STATUSES.ACTIVE,
          isActive: true,
        },
      ],
      session ? { session } : undefined,
    );

    return created!.toObject() as LeanPatient;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const path = duplicateKeyPath(error);
      if (path === "email") {
        throw new ConflictError(
          "Another patient already uses this email address",
        );
      }
      if (path === "canonicalPhone") {
        throw new ConflictError(
          "Another patient already uses this phone number",
        );
      }
      throw new ConflictError("Patient contact details conflict with an existing record");
    }
    throw error;
  }
}

export async function updatePatientRecord(
  id: string,
  updates: Record<string, unknown>,
  session?: ClientSession,
): Promise<LeanPatient> {
  try {
    const query = Patient.findOneAndUpdate(
      { _id: new MongooseTypes.ObjectId(id), deletedAt: null },
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (session) {
      query.session(session);
    }

    const updated = await query.lean<LeanPatient>();
    if (!updated) {
      throw new NotFoundError("Patient not found");
    }
    return updated;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    if (isDuplicateKeyError(error)) {
      const path = duplicateKeyPath(error);
      if (path === "email") {
        throw new ConflictError(
          "Another patient already uses this email address",
        );
      }
      if (path === "canonicalPhone") {
        throw new ConflictError(
          "Another patient already uses this phone number",
        );
      }
      throw new ConflictError("Patient contact details conflict with an existing record");
    }
    throw error;
  }
}

export async function listPatientDocuments(
  filter: Record<string, unknown>,
  page: number,
  limit: number,
): Promise<{ items: LeanPatient[]; total: number }> {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Patient.find(filter)
      .sort({ fullName: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanPatient[]>(),
    Patient.countDocuments(filter),
  ]);

  return { items, total };
}
