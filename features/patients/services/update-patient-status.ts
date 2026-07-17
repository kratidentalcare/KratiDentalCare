import "server-only";

import { syncPatientActiveFields } from "@/features/patients/lib/status";
import {
  findPatientByIdOrThrow,
  updatePatientRecord,
} from "@/features/patients/repositories/patient-repository";
import type { PatientStatusUpdateResult } from "@/features/patients/types";
import { connect } from "@/lib/db";
import type { UpdatePatientActiveStatusInput } from "@/validators/patient";

export async function updatePatientActiveStatus(
  id: string,
  input: UpdatePatientActiveStatusInput,
): Promise<PatientStatusUpdateResult> {
  await connect();

  await findPatientByIdOrThrow(id);
  const synced = syncPatientActiveFields(input.status);
  const updated = await updatePatientRecord(id, synced);

  return {
    id: String(updated._id),
    status: updated.status,
    isActive: updated.isActive,
  };
}
