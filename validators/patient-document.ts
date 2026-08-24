import { z } from "zod";

import {
  PATIENT_DOCUMENT_DEFAULT_MAX_BYTES,
  PATIENT_DOCUMENT_EXTENSIONS,
  PATIENT_DOCUMENT_LIST_DEFAULT_LIMIT,
  PATIENT_DOCUMENT_MIME_TYPES,
  PATIENT_DOCUMENT_TYPE_VALUES,
} from "@/constants/patient-documents";
import { PAGINATION } from "@/constants/pagination";
import { objectIdSchema } from "@/validators/common";

const NAME_MAX = 200;
const DESCRIPTION_MAX = 2000;

function extensionOf(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  if (index < 0) {
    return "";
  }
  return fileName.slice(index).toLowerCase();
}

/**
 * Shared file refine used by server actions (MIME + extension + size).
 */
export function createPatientDocumentFileSchema(maxBytes: number) {
  return z
    .instanceof(File, { message: "A file is required" })
    .refine(
      (file) =>
        (PATIENT_DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type),
      "File must be JPEG, PNG, WebP, or PDF",
    )
    .refine(
      (file) =>
        (PATIENT_DOCUMENT_EXTENSIONS as readonly string[]).includes(
          extensionOf(file.name),
        ),
      "File extension must be .jpg, .jpeg, .png, .webp, or .pdf",
    )
    .refine(
      (file) => file.size > 0 && file.size <= maxBytes,
      `File must be ${Math.round(maxBytes / (1024 * 1024))} MB or smaller`,
    );
}

/** Metadata fields for upload (file validated separately). */
export const patientDocumentUploadMetaSchema = z
  .object({
    patientId: objectIdSchema,
    name: z
      .string()
      .trim()
      .min(1, "Document name is required")
      .max(NAME_MAX, "Document name is too long"),
    type: z.enum(PATIENT_DOCUMENT_TYPE_VALUES),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_MAX, "Description is too long")
      .optional()
      .transform((value) => (value === "" || value === undefined ? null : value)),
  })
  .strict();

export type PatientDocumentUploadMeta = z.infer<
  typeof patientDocumentUploadMetaSchema
>;

/**
 * Client form schema (includes File).
 * Uses the default max size; the server re-validates with env-configured limit.
 */
export const patientDocumentUploadFormSchema =
  patientDocumentUploadMetaSchema
    .omit({ patientId: true })
    .extend({
      file: createPatientDocumentFileSchema(PATIENT_DOCUMENT_DEFAULT_MAX_BYTES),
    })
    .strict();

export type PatientDocumentUploadFormValues = z.infer<
  typeof patientDocumentUploadFormSchema
>;

export const patientDocumentListQuerySchema = z
  .object({
    patientId: objectIdSchema,
    page: z.coerce
      .number()
      .int()
      .min(PAGINATION.MIN_PAGE)
      .default(PAGINATION.DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(PAGINATION.MIN_LIMIT)
      .max(PAGINATION.MAX_LIMIT)
      .default(PATIENT_DOCUMENT_LIST_DEFAULT_LIMIT),
    type: z.enum(PATIENT_DOCUMENT_TYPE_VALUES).optional(),
    search: z.string().trim().max(200).optional(),
  })
  .strict();

export type PatientDocumentListQuery = z.infer<
  typeof patientDocumentListQuerySchema
>;

export const deletePatientDocumentSchema = z
  .object({
    documentId: objectIdSchema,
  })
  .strict();
