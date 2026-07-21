"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { getPatientProfile } from "@/features/patients/services/get-patient-profile";
import { listPatients } from "@/features/patients/services/list-patients";
import { updatePatientContact } from "@/features/patients/services/update-patient-contact";
import { updatePatientActiveStatus } from "@/features/patients/services/update-patient-status";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import {
  patientListQuerySchema,
  updatePatientActiveStatusSchema,
  updatePatientContactSchema,
} from "@/validators/patient";
import { objectIdSchema } from "@/validators/common";
import { z } from "zod";

function revalidatePatients(patientId?: string) {
  revalidatePath(ROUTES.DASHBOARD.ROOT);
  revalidatePath(ROUTES.DASHBOARD.PATIENTS);
  if (patientId) {
    revalidatePath(`${ROUTES.DASHBOARD.PATIENTS}/${patientId}`);
  }
}

export async function listPatientsAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof listPatients>>>> {
  try {
    await requirePermission(PERMISSIONS.PATIENTS_READ);

    const parsed = patientListQuerySchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await listPatients(parsed.data);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function getPatientProfileAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof getPatientProfile>>>> {
  try {
    await requirePermission(PERMISSIONS.PATIENTS_READ);

    const parsed = z
      .object({
        id: objectIdSchema,
        historyPage: z.coerce.number().int().min(1).optional(),
        historyLimit: z.coerce.number().int().min(1).max(100).optional(),
      })
      .safeParse(input);

    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await getPatientProfile(
      parsed.data.id,
      parsed.data.historyPage,
      parsed.data.historyLimit,
    );
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function updatePatientContactAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof updatePatientContact>>>> {
  try {
    await requirePermission(PERMISSIONS.PATIENTS_MANAGE);

    const parsed = z
      .object({
        id: objectIdSchema,
        data: updatePatientContactSchema,
      })
      .safeParse(input);

    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await updatePatientContact(
      parsed.data.id,
      parsed.data.data,
    );
    revalidatePatients(parsed.data.id);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function updatePatientActiveStatusAction(
  input: unknown,
): Promise<
  ActionResult<Awaited<ReturnType<typeof updatePatientActiveStatus>>>
> {
  try {
    await requirePermission(PERMISSIONS.PATIENTS_MANAGE);

    const parsed = z
      .object({
        id: objectIdSchema,
        data: updatePatientActiveStatusSchema,
      })
      .safeParse(input);

    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await updatePatientActiveStatus(
      parsed.data.id,
      parsed.data.data,
    );
    revalidatePatients(parsed.data.id);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
