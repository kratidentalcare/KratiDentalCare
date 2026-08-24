import "server-only";

import {
  PATIENT_DOCUMENT_TYPE_LABELS,
  type PatientDocumentType,
} from "@/constants/patient-documents";
import { buildCloudinaryThumbnailUrl } from "@/lib/cloudinary";
import type { LeanPatientDocument } from "@/models/patient-document";
import type { LeanUser } from "@/models/user";

import {
  fileExtensionFromName,
  formatFileSize,
  formatUploaderName,
} from "../lib/format";
import type { PatientDocumentListItem } from "../types";

export function mapPatientDocumentToListItem(
  doc: LeanPatientDocument,
  uploader: Pick<LeanUser, "firstName" | "lastName" | "email"> | null,
): PatientDocumentListItem {
  const isImage = doc.mimeType.startsWith("image/");
  const thumbnailUrl = isImage
    ? buildCloudinaryThumbnailUrl(doc.fileUrl)
    : null;

  return {
    id: String(doc._id),
    patientId: String(doc.patientId),
    name: doc.name,
    type: doc.type as PatientDocumentType,
    typeLabel: PATIENT_DOCUMENT_TYPE_LABELS[doc.type as PatientDocumentType],
    description: doc.description,
    fileUrl: doc.fileUrl,
    thumbnailUrl,
    resourceType: doc.resourceType,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    fileSizeLabel: formatFileSize(doc.fileSize),
    fileExtension: fileExtensionFromName(doc.originalFileName, doc.mimeType),
    originalFileName: doc.originalFileName,
    uploadedById: String(doc.uploadedBy),
    uploadedByName: formatUploaderName(
      uploader?.firstName,
      uploader?.lastName,
      uploader?.email,
    ),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
