import "server-only";

import { getOrCreateModel } from "@/models/base";

import {
  PRESCRIPTION_MODEL_NAME,
  prescriptionSchema,
} from "./schema";
import type { PrescriptionDocument, PrescriptionModel } from "./types";

/**
 * Prescription model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Prescription = getOrCreateModel<PrescriptionDocument>(
  PRESCRIPTION_MODEL_NAME,
  prescriptionSchema,
) as PrescriptionModel;

export type {
  LeanPrescription,
  PrescriptionDoctorSnapshot,
  PrescriptionDocument,
  PrescriptionFields,
  PrescriptionMedication,
  PrescriptionModel,
  PrescriptionPatientSnapshot,
} from "./types";
export { PRESCRIPTION_MODEL_NAME, prescriptionSchema } from "./schema";
