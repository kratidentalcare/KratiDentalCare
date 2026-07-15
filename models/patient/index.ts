import "server-only";

import { getOrCreateModel } from "@/models/base";

import { patientSchema } from "./schema";
import type { PatientDocument, PatientModel } from "./types";

export const PATIENT_MODEL_NAME = "Patient";

/**
 * Patient model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Patient = getOrCreateModel<PatientDocument>(
  PATIENT_MODEL_NAME,
  patientSchema,
) as PatientModel;

export type {
  LeanPatient,
  PatientAddress,
  PatientDocument,
  PatientFields,
  PatientModel,
} from "./types";
export { patientSchema } from "./schema";
