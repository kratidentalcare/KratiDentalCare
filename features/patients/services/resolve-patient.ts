import "server-only";

import type { ClientSession } from "mongoose";

import { normalizeEmail } from "@/features/patients/lib/email";
import {
  phonesShareIdentity,
  toCanonicalPhone,
  toDisplayPhone,
} from "@/features/patients/lib/phone";
import { dateOfBirthFromAgeYears } from "@/features/patients/lib/age";
import {
  createPatientRecord,
  findPatientByEmailExcludingId,
  findPatientByNormalizedEmail,
  findPatientsByPhoneIdentity,
  updatePatientRecord,
} from "@/features/patients/repositories/patient-repository";
import type { ResolvePatientInput } from "@/features/patients/types";
import { ConflictError } from "@/lib/errors";
import type { LeanPatient } from "@/models/patient";

/**
 * Resolves a patient by normalized phone OR email for booking flows.
 * Does not merge two existing charts when identifiers point at different rows.
 */
export async function resolveOrCreatePatient(
  input: ResolvePatientInput,
  session?: ClientSession,
): Promise<LeanPatient> {
  const fullName = input.fullName.trim();
  const displayPhone = toDisplayPhone(input.phone);
  const canonicalPhone = toCanonicalPhone(input.phone);
  const email = normalizeEmail(input.email);
  const gender = input.gender ?? null;
  const dateOfBirth =
    input.ageYears != null && Number.isInteger(input.ageYears)
      ? dateOfBirthFromAgeYears(input.ageYears)
      : null;

  if (!canonicalPhone || canonicalPhone.replace(/\D/g, "").length < 7) {
    throw new ConflictError("A valid phone number is required");
  }

  const phoneMatches = await findPatientsByPhoneIdentity(displayPhone, session);
  const phoneMatch = phoneMatches[0] ?? null;
  const emailMatch = email
    ? await findPatientByNormalizedEmail(email, session)
    : null;

  if (
    phoneMatch &&
    emailMatch &&
    String(phoneMatch._id) !== String(emailMatch._id)
  ) {
    throw new ConflictError(
      "This email and phone belong to different patient records",
    );
  }

  const existing = phoneMatch ?? emailMatch;

  if (!existing) {
    return createPatientRecord(
      {
        fullName,
        phone: displayPhone,
        email,
        gender,
        dateOfBirth,
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

  const existingPhone = existing.canonicalPhone || existing.phone;
  if (
    !phonesShareIdentity(existingPhone, input.phone) &&
    canonicalPhone !== existing.canonicalPhone
  ) {
    const phoneOwners = await findPatientsByPhoneIdentity(displayPhone, session);
    const otherOwner = phoneOwners.find(
      (patient) => String(patient._id) !== String(existing._id),
    );
    if (otherOwner) {
      throw new ConflictError(
        "Another patient already uses this phone number",
      );
    }
  }

  const updates: Record<string, string | Date | null | boolean> = {};

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
  if (gender && existing.gender !== gender) {
    updates.gender = gender;
  }
  if (dateOfBirth) {
    const existingDob = existing.dateOfBirth
      ? existing.dateOfBirth.getTime()
      : null;
    if (existingDob !== dateOfBirth.getTime()) {
      updates.dateOfBirth = dateOfBirth;
    }
  }

  if (Object.keys(updates).length === 0) {
    return existing;
  }

  return updatePatientRecord(String(existing._id), updates, session);
}
