import "server-only";

import type { ClientSession } from "mongoose";

import {
  normalizePhone,
  toDisplayPhone,
} from "@/features/patients/lib/phone";
import {
  createPatientRecord,
  findPatientByEmailExcludingId,
  findPatientsByPhoneIdentity,
  updatePatientRecord,
} from "@/features/patients/repositories/patient-repository";
import type { ResolvePatientInput } from "@/features/patients/types";
import { ConflictError } from "@/lib/errors";
import type { LeanPatient } from "@/models/patient";

function normalizeEmail(email: string | null | undefined): string | null {
  if (email == null) {
    return null;
  }
  const trimmed = email.trim().toLowerCase();
  return trimmed === "" ? null : trimmed;
}

/**
 * Atomically resolves a patient by canonical phone for booking flows.
 * Updates supplied current contact fields; rejects email owned by another chart.
 */
export async function resolveOrCreatePatient(
  input: ResolvePatientInput,
  session?: ClientSession,
): Promise<LeanPatient> {
  const fullName = input.fullName.trim();
  const displayPhone = toDisplayPhone(input.phone);
  const canonicalPhone = normalizePhone(input.phone);
  const email = normalizeEmail(input.email);

  if (!canonicalPhone || canonicalPhone.replace(/\D/g, "").length < 7) {
    throw new ConflictError("A valid phone number is required");
  }

  const matches = await findPatientsByPhoneIdentity(displayPhone, session);
  const existing = matches[0] ?? null;

  if (!existing) {
    return createPatientRecord(
      {
        fullName,
        phone: displayPhone,
        email,
      },
      session,
    );
  }

  if (email) {
    const emailOwner = await findPatientByEmailExcludingId(
      email,
      existing._id,
      session,
    );
    if (emailOwner) {
      throw new ConflictError(
        "Another patient already uses this email address",
      );
    }
  }

  const updates: Record<string, string | null | boolean> = {};

  if (existing.fullName !== fullName) {
    updates.fullName = fullName;
  }
  if (existing.phone !== displayPhone) {
    updates.phone = displayPhone;
  }
  if (existing.canonicalPhone !== canonicalPhone) {
    updates.canonicalPhone = canonicalPhone;
  }
  if (email && existing.email !== email) {
    updates.email = email;
  }

  if (Object.keys(updates).length === 0) {
    return existing;
  }

  return updatePatientRecord(String(existing._id), updates, session);
}
