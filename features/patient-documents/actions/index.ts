"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { deletePatientDocument } from "@/features/patient-documents/services/delete-patient-document";
import { getPatientDocument } from "@/features/patient-documents/services/get-patient-document";
import { listPatientDocuments } from "@/features/patient-documents/services/list-patient-documents";
import { uploadPatientDocument } from "@/features/patient-documents/services/upload-patient-document";
import type {
  PatientDocumentListItem,
  PatientDocumentListResult,
  UploadPatientDocumentResult,
} from "@/features/patient-documents/types";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import type { ActionResult } from "@/types/api";
import {
  createPatientDocumentFileSchema,
  deletePatientDocumentSchema,
  patientDocumentListQuerySchema,
  patientDocumentUploadMetaSchema,
} from "@/validators/patient-document";
import { getPatientDocumentMaxBytes } from "@/config/env";
import { objectIdSchema } from "@/validators/common";
import { z } from "zod";

function revalidatePatientDocuments(patientId: string) {
  revalidatePath(`${ROUTES.DASHBOARD.PATIENTS}/${patientId}`);
  revalidatePath(ROUTES.DASHBOARD.PATIENTS);
}

/**
 * Upload a medical document for a patient (FormData).
 * Fields: patientId, name, type, description?, file
 */
export async function uploadPatientDocumentAction(
  formData: FormData,
): Promise<ActionResult<UploadPatientDocumentResult>> {
  try {
    const user = await requirePermission(
      PERMISSIONS.PATIENTS_DOCUMENTS_MANAGE,
    );

    const metaParsed = patientDocumentUploadMetaSchema.safeParse({
      patientId: formData.get("patientId"),
      name: formData.get("name"),
      type: formData.get("type"),
      description: formData.get("description") ?? undefined,
    });

    if (!metaParsed.success) {
      return toActionResult(validationErrorResponse(metaParsed.error));
    }

    const file = formData.get("file");
    const fileParsed = createPatientDocumentFileSchema(
      getPatientDocumentMaxBytes(),
    ).safeParse(file);

    if (!fileParsed.success) {
      return toActionResult(validationErrorResponse(fileParsed.error));
    }

    const data = await uploadPatientDocument({
      patientId: metaParsed.data.patientId,
      uploadedByUserId: String(user._id),
      name: metaParsed.data.name,
      type: metaParsed.data.type,
      description: metaParsed.data.description,
      file: fileParsed.data,
    });

    revalidatePatientDocuments(metaParsed.data.patientId);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function listPatientDocumentsAction(
  input: unknown,
): Promise<ActionResult<PatientDocumentListResult>> {
  try {
    await requirePermission(PERMISSIONS.PATIENTS_READ);

    const parsed = patientDocumentListQuerySchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await listPatientDocuments(parsed.data);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function getPatientDocumentAction(
  input: unknown,
): Promise<ActionResult<PatientDocumentListItem>> {
  try {
    await requirePermission(PERMISSIONS.PATIENTS_READ);

    const parsed = z
      .object({ documentId: objectIdSchema })
      .safeParse(input);

    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await getPatientDocument(parsed.data.documentId);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function deletePatientDocumentAction(
  input: unknown,
): Promise<ActionResult<{ id: string; patientId: string }>> {
  try {
    const user = await requirePermission(
      PERMISSIONS.PATIENTS_DOCUMENTS_MANAGE,
    );

    const parsed = deletePatientDocumentSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await deletePatientDocument({
      documentId: parsed.data.documentId,
      performedByUserId: String(user._id),
    });

    revalidatePatientDocuments(data.patientId);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
