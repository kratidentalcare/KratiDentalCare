import "server-only";

import { getOrCreateModel } from "@/models/base";

import {
  PATIENT_DOCUMENT_MODEL_NAME,
  patientDocumentSchema,
} from "./schema";
import type {
  PatientDocumentModel,
  PatientDocumentRecord,
} from "./types";

/**
 * PatientDocument model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const PatientDocument = getOrCreateModel<PatientDocumentRecord>(
  PATIENT_DOCUMENT_MODEL_NAME,
  patientDocumentSchema,
) as PatientDocumentModel;

export type {
  LeanPatientDocument,
  PatientDocumentFields,
  PatientDocumentModel,
  PatientDocumentRecord,
} from "./types";
export {
  PATIENT_DOCUMENT_MODEL_NAME,
  patientDocumentSchema,
} from "./schema";
