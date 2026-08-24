import "server-only";

import { getPatientDocumentMaxBytes } from "@/config/env";
import { AUDIT_ACTIONS } from "@/models/audit-log";
import { findPatientByIdOrThrow } from "@/features/patients/repositories/patient-repository";
import { writeAuditLog } from "@/features/users/services/write-audit-log";
import {
  deleteFileFromCloudinary,
  isCloudinaryConfigured,
  uploadFileToCloudinary,
} from "@/lib/cloudinary";
import { connect } from "@/lib/db";
import { ConfigurationError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { User } from "@/models/user";
import {
  createPatientDocumentFileSchema,
  patientDocumentUploadMetaSchema,
} from "@/validators/patient-document";

import { mapPatientDocumentToListItem } from "../lib/map-document";
import { insertPatientDocument } from "../repositories/document-repository";
import type { UploadPatientDocumentResult } from "../types";

export async function uploadPatientDocument(input: {
  patientId: string;
  uploadedByUserId: string;
  name: string;
  type: string;
  description?: string | null;
  file: File;
}): Promise<UploadPatientDocumentResult> {
  await connect();

  if (!isCloudinaryConfigured()) {
    throw new ConfigurationError(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const metaParsed = patientDocumentUploadMetaSchema.safeParse({
    patientId: input.patientId,
    name: input.name,
    type: input.type,
    description: input.description ?? undefined,
  });

  if (!metaParsed.success) {
    throw new ValidationError(
      metaParsed.error.issues[0]?.message ?? "Invalid document metadata",
    );
  }

  const maxBytes = getPatientDocumentMaxBytes();
  const fileParsed = createPatientDocumentFileSchema(maxBytes).safeParse(
    input.file,
  );
  if (!fileParsed.success) {
    throw new ValidationError(
      fileParsed.error.issues[0]?.message ?? "Invalid document file",
    );
  }

  const file = fileParsed.data;
  const meta = metaParsed.data;

  await findPatientByIdOrThrow(meta.patientId);

  const bytes = Buffer.from(await file.arrayBuffer());
  const folder = `kratidentalcare/patients/${meta.patientId}/documents`;

  const uploaded = await uploadFileToCloudinary({
    bytes,
    mimeType: file.type,
    folder,
    fileName: file.name,
  });

  let created;
  try {
    created = await insertPatientDocument({
      patientId: meta.patientId,
      uploadedBy: input.uploadedByUserId,
      name: meta.name,
      type: meta.type,
      description: meta.description,
      fileUrl: uploaded.secureUrl,
      cloudinaryPublicId: uploaded.publicId,
      resourceType: uploaded.resourceType,
      mimeType: file.type,
      fileSize: uploaded.bytes,
      originalFileName: file.name || null,
    });
  } catch (error) {
    logger.error(
      "Failed to persist patient document after Cloudinary upload",
      error,
    );
    try {
      await deleteFileFromCloudinary({
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
      });
    } catch (cleanupError) {
      logger.error(
        "Failed to clean up Cloudinary asset after DB insert failure",
        cleanupError,
      );
    }
    throw error;
  }

  await writeAuditLog({
    action: AUDIT_ACTIONS.DOCUMENT_UPLOADED,
    targetUserId: input.uploadedByUserId,
    performedByUserId: input.uploadedByUserId,
    patientId: meta.patientId,
    resourceId: String(created._id),
    after: {
      name: created.name,
      type: created.type,
      cloudinaryPublicId: created.cloudinaryPublicId,
    },
  });

  const uploader = await User.findById(input.uploadedByUserId)
    .select("firstName lastName email")
    .lean();

  return mapPatientDocumentToListItem(created, uploader);
}
