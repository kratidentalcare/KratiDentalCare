import type { Model, Types } from "mongoose";

import type { PatientDocumentType } from "@/constants/patient-documents";
import type {
  LeanSoftDeleteDocument,
  SoftDeleteDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Patient medical file metadata (binary lives in Cloudinary).
 * Hydrated Mongoose type is `PatientDocumentRecord` to avoid clashing with
 * the Patient model's `PatientDocument` type.
 */
export type PatientDocumentFields = {
  patientId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  name: string;
  type: PatientDocumentType;
  description: string | null;
  fileUrl: string;
  cloudinaryPublicId: string;
  resourceType: string;
  mimeType: string;
  fileSize: number;
  originalFileName: string | null;
};

export type PatientDocumentRecord = SoftDeleteDocument & PatientDocumentFields;

export type LeanPatientDocument = LeanSoftDeleteDocument & PatientDocumentFields;

export type PatientDocumentModel = Model<
  PatientDocumentRecord,
  SoftDeleteQueryHelpers
>;
