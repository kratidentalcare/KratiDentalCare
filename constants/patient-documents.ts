/**
 * Patient medical document types and upload constraints.
 */

export const PATIENT_DOCUMENT_TYPES = {
  X_RAY: "X_RAY",
  SCAN: "SCAN",
  LAB_REPORT: "LAB_REPORT",
  MEDICAL_REPORT: "MEDICAL_REPORT",
  TREATMENT_IMAGE: "TREATMENT_IMAGE",
  BEFORE_AFTER: "BEFORE_AFTER",
  OTHER: "OTHER",
} as const;

export type PatientDocumentType =
  (typeof PATIENT_DOCUMENT_TYPES)[keyof typeof PATIENT_DOCUMENT_TYPES];

export const PATIENT_DOCUMENT_TYPE_VALUES = [
  PATIENT_DOCUMENT_TYPES.X_RAY,
  PATIENT_DOCUMENT_TYPES.SCAN,
  PATIENT_DOCUMENT_TYPES.LAB_REPORT,
  PATIENT_DOCUMENT_TYPES.MEDICAL_REPORT,
  PATIENT_DOCUMENT_TYPES.TREATMENT_IMAGE,
  PATIENT_DOCUMENT_TYPES.BEFORE_AFTER,
  PATIENT_DOCUMENT_TYPES.OTHER,
] as const satisfies readonly PatientDocumentType[];

export const PATIENT_DOCUMENT_TYPE_LABELS: Record<PatientDocumentType, string> =
  {
    [PATIENT_DOCUMENT_TYPES.X_RAY]: "X-Ray",
    [PATIENT_DOCUMENT_TYPES.SCAN]: "Scan",
    [PATIENT_DOCUMENT_TYPES.LAB_REPORT]: "Lab Report",
    [PATIENT_DOCUMENT_TYPES.MEDICAL_REPORT]: "Medical Report",
    [PATIENT_DOCUMENT_TYPES.TREATMENT_IMAGE]: "Treatment Image",
    [PATIENT_DOCUMENT_TYPES.BEFORE_AFTER]: "Before/After",
    [PATIENT_DOCUMENT_TYPES.OTHER]: "Other",
  };

export const PATIENT_DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type PatientDocumentMimeType =
  (typeof PATIENT_DOCUMENT_MIME_TYPES)[number];

export const PATIENT_DOCUMENT_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
] as const;

/** Default 15 MB — overridable via PATIENT_DOCUMENT_MAX_BYTES. */
export const PATIENT_DOCUMENT_DEFAULT_MAX_BYTES = 15 * 1024 * 1024;

export const PATIENT_DOCUMENT_LIST_DEFAULT_LIMIT = 12;
