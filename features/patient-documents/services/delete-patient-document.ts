import "server-only";

import { AUDIT_ACTIONS } from "@/models/audit-log";
import { findPatientByIdOrThrow } from "@/features/patients/repositories/patient-repository";
import { writeAuditLog } from "@/features/users/services/write-audit-log";
import {
  deleteFileFromCloudinary,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import { connect } from "@/lib/db";
import { ConfigurationError, NotFoundError } from "@/lib/errors";

import {
  findPatientDocumentByIdOrThrow,
  softDeletePatientDocumentById,
} from "../repositories/document-repository";

export async function deletePatientDocument(input: {
  documentId: string;
  performedByUserId: string;
}): Promise<{ id: string; patientId: string }> {
  await connect();

  if (!isCloudinaryConfigured()) {
    throw new ConfigurationError(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const doc = await findPatientDocumentByIdOrThrow(input.documentId);
  const patientId = String(doc.patientId);

  await findPatientByIdOrThrow(patientId);

  // Cloudinary first — on failure leave Mongo untouched.
  await deleteFileFromCloudinary({
    publicId: doc.cloudinaryPublicId,
    resourceType: doc.resourceType,
  });

  try {
    await softDeletePatientDocumentById(input.documentId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Race: already deleted after Cloudinary success — treat as success.
    } else {
      throw error;
    }
  }

  await writeAuditLog({
    action: AUDIT_ACTIONS.DOCUMENT_DELETED,
    targetUserId: input.performedByUserId,
    performedByUserId: input.performedByUserId,
    patientId,
    resourceId: input.documentId,
    before: {
      name: doc.name,
      type: doc.type,
      cloudinaryPublicId: doc.cloudinaryPublicId,
    },
  });

  return { id: input.documentId, patientId };
}
