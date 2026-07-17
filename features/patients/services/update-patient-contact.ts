import "server-only";

import {
  normalizePhone,
  toDisplayPhone,
} from "@/features/patients/lib/phone";
import {
  findPatientByEmailExcludingId,
  findPatientByIdOrThrow,
  findPatientsByPhoneIdentity,
  updatePatientRecord,
} from "@/features/patients/repositories/patient-repository";
import type { PatientContactUpdateResult } from "@/features/patients/types";
import { connect } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import type { UpdatePatientContactInput } from "@/validators/patient";

export async function updatePatientContact(
  id: string,
  input: UpdatePatientContactInput,
): Promise<PatientContactUpdateResult> {
  await connect();

  await findPatientByIdOrThrow(id);
  const fullName = input.fullName.trim();
  const displayPhone = toDisplayPhone(input.phone);
  const canonicalPhone = normalizePhone(input.phone);
  const email = input.email;

  if (!canonicalPhone || canonicalPhone.replace(/\D/g, "").length < 7) {
    throw new ConflictError("A valid phone number is required");
  }

  const phoneMatches = await findPatientsByPhoneIdentity(displayPhone);
  const conflictingPhone = phoneMatches.find(
    (patient) => String(patient._id) !== id,
  );
  if (conflictingPhone) {
    throw new ConflictError(
      "Another patient already uses this phone number",
    );
  }

  if (email) {
    const emailOwner = await findPatientByEmailExcludingId(email, id);
    if (emailOwner) {
      throw new ConflictError(
        "Another patient already uses this email address",
      );
    }
  }

  const updated = await updatePatientRecord(id, {
    fullName,
    phone: displayPhone,
    canonicalPhone,
    email,
  });

  return {
    id: String(updated._id),
    fullName: updated.fullName,
    phone: updated.phone,
    email: updated.email,
    status: updated.status,
  };
}
