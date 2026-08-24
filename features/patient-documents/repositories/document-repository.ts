import "server-only";

import { Types } from "mongoose";

import type { PatientDocumentType } from "@/constants/patient-documents";
import { NotFoundError } from "@/lib/errors";
import {
  PatientDocument,
  type LeanPatientDocument,
} from "@/models/patient-document";
import { getPaginationSkip } from "@/types/pagination";

import { escapeRegex } from "../lib/format";

export async function insertPatientDocument(input: {
  patientId: string;
  uploadedBy: string;
  name: string;
  type: PatientDocumentType;
  description: string | null;
  fileUrl: string;
  cloudinaryPublicId: string;
  resourceType: string;
  mimeType: string;
  fileSize: number;
  originalFileName: string | null;
}): Promise<LeanPatientDocument> {
  const created = await PatientDocument.create({
    patientId: new Types.ObjectId(input.patientId),
    uploadedBy: new Types.ObjectId(input.uploadedBy),
    name: input.name,
    type: input.type,
    description: input.description,
    fileUrl: input.fileUrl,
    cloudinaryPublicId: input.cloudinaryPublicId,
    resourceType: input.resourceType,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    originalFileName: input.originalFileName,
  });

  return created.toObject() as LeanPatientDocument;
}

export async function findPatientDocumentById(
  documentId: string,
): Promise<LeanPatientDocument | null> {
  return PatientDocument.findById(documentId).lean<LeanPatientDocument>();
}

export async function findPatientDocumentByIdOrThrow(
  documentId: string,
): Promise<LeanPatientDocument> {
  const doc = await findPatientDocumentById(documentId);
  if (!doc) {
    throw new NotFoundError("Document not found");
  }
  return doc;
}

export async function softDeletePatientDocumentById(
  documentId: string,
): Promise<void> {
  const result = await PatientDocument.updateOne(
    { _id: new Types.ObjectId(documentId), deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );

  if (result.matchedCount === 0) {
    throw new NotFoundError("Document not found");
  }
}

export type ListPatientDocumentsFilter = {
  patientId: string;
  type?: PatientDocumentType;
  search?: string;
  page: number;
  limit: number;
};

export async function listPatientDocumentRecords(
  filter: ListPatientDocumentsFilter,
): Promise<{ items: LeanPatientDocument[]; total: number }> {
  const query: Record<string, unknown> = {
    patientId: new Types.ObjectId(filter.patientId),
    deletedAt: null,
  };

  if (filter.type) {
    query.type = filter.type;
  }

  const search = filter.search?.trim();
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    query.$or = [{ name: pattern }, { description: pattern }];
  }

  const skip = getPaginationSkip(filter.page, filter.limit);

  const [items, total] = await Promise.all([
    PatientDocument.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(filter.limit)
      .lean<LeanPatientDocument[]>(),
    PatientDocument.countDocuments(query),
  ]);

  return { items, total };
}
