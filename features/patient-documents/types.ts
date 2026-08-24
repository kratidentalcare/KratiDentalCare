import type { PatientDocumentType } from "@/constants/patient-documents";
import type { PaginationMeta } from "@/types/api";

export type PatientDocumentListItem = {
  id: string;
  patientId: string;
  name: string;
  type: PatientDocumentType;
  typeLabel: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  resourceType: string;
  mimeType: string;
  fileSize: number;
  fileSizeLabel: string;
  fileExtension: string;
  originalFileName: string | null;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientDocumentListResult = {
  items: PatientDocumentListItem[];
  pagination: PaginationMeta & {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type UploadPatientDocumentResult = PatientDocumentListItem;
