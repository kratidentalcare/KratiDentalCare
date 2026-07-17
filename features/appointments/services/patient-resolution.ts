import "server-only";

import { PATIENT_STATUSES } from "@/constants/statuses";
import { connect } from "@/lib/db";
import { Patient, type LeanPatient } from "@/models/patient";
import type { PublicBookingInput } from "@/validators/appointment-booking";

function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").trim();
}

/**
 * Finds an existing patient by phone or creates a minimal chart for public booking.
 */
export async function resolveOrCreatePatient(
  input: Pick<PublicBookingInput, "fullName" | "phone" | "email">,
): Promise<LeanPatient> {
  await connect();

  const phone = normalizePhone(input.phone);
  const email = input.email.trim().toLowerCase() || null;

  const existing = await Patient.findOne({
    phone,
    deletedAt: null,
    status: PATIENT_STATUSES.ACTIVE,
  }).lean<LeanPatient>();

  if (existing) {
    const updates: Record<string, string | null> = {};
    if (existing.fullName !== input.fullName.trim()) {
      updates.fullName = input.fullName.trim();
    }
    if (email && existing.email !== email) {
      updates.email = email;
    }

    if (Object.keys(updates).length > 0) {
      const updated = await Patient.findOneAndUpdate(
        { _id: existing._id },
        { $set: updates },
        { new: true },
      ).lean<LeanPatient>();
      return updated ?? existing;
    }

    return existing;
  }

  const created = await Patient.create({
    fullName: input.fullName.trim(),
    phone,
    email,
    status: PATIENT_STATUSES.ACTIVE,
  });

  return created.toObject() as LeanPatient;
}
