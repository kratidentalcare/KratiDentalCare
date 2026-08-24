import "server-only";

import { findPatientByIdOrThrow } from "@/features/patients/repositories/patient-repository";
import { connect } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { User } from "@/models/user";

import { mapPatientDocumentToListItem } from "../lib/map-document";
import { findPatientDocumentByIdOrThrow } from "../repositories/document-repository";
import type { PatientDocumentListItem } from "../types";

export async function getPatientDocument(
  documentId: string,
): Promise<PatientDocumentListItem> {
  await connect();

  const doc = await findPatientDocumentByIdOrThrow(documentId);
  await findPatientByIdOrThrow(String(doc.patientId));

  const uploader = await User.findById(doc.uploadedBy)
    .select("firstName lastName email")
    .lean();

  return mapPatientDocumentToListItem(doc, uploader);
}

/**
 * Ensures the document belongs to the given patient (authorization boundary).
 */
export async function getPatientDocumentForPatient(
  documentId: string,
  patientId: string,
): Promise<PatientDocumentListItem> {
  await connect();

  const doc = await findPatientDocumentByIdOrThrow(documentId);
  if (String(doc.patientId) !== patientId) {
    throw new NotFoundError("Document not found");
  }

  await findPatientByIdOrThrow(patientId);

  const uploader = await User.findById(doc.uploadedBy)
    .select("firstName lastName email")
    .lean();

  return mapPatientDocumentToListItem(doc, uploader);
}
