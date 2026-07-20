import "server-only";

import type { ClientSession } from "mongoose";

import { resolveOrCreatePatient as resolvePatient } from "@/features/patients/services/resolve-patient";
import type { LeanPatient } from "@/models/patient";
import type { PublicBookingInput } from "@/validators/appointment-booking";

/**
 * Compatibility delegate — patient resolution lives in the patients feature.
 */
export async function resolveOrCreatePatient(
  input: Pick<
    PublicBookingInput,
    "fullName" | "phone" | "email" | "ageYears" | "gender"
  >,
  session?: ClientSession,
): Promise<LeanPatient> {
  return resolvePatient(
    {
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      ageYears: input.ageYears,
      gender: input.gender,
    },
    session,
  );
}
