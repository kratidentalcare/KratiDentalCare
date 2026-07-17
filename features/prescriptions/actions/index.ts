"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { listPrescriptionsService } from "@/features/prescriptions/services/list-prescriptions";
import {
  getPrescriptionDetail,
  resolvePrescriptionWorkspace,
  savePrescriptionForAppointment,
} from "@/features/prescriptions/services/save-prescription";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import { objectIdSchema } from "@/validators/common";
import {
  prescriptionFormSchema,
  prescriptionListQuerySchema,
} from "@/validators/prescription";

function revalidatePrescriptionPaths(options?: {
  prescriptionId?: string;
  patientId?: string;
  appointmentId?: string;
}) {
  revalidatePath(ROUTES.DASHBOARD.PRESCRIPTIONS);
  revalidatePath(ROUTES.DASHBOARD.APPOINTMENTS);
  if (options?.prescriptionId) {
    revalidatePath(
      `${ROUTES.DASHBOARD.PRESCRIPTIONS}/${options.prescriptionId}`,
    );
  }
  if (options?.patientId) {
    revalidatePath(`${ROUTES.DASHBOARD.PATIENTS}/${options.patientId}`);
  }
  if (options?.appointmentId) {
    revalidatePath(
      `${ROUTES.DASHBOARD.PRESCRIPTIONS}?appointmentId=${options.appointmentId}`,
    );
  }
}

export async function listPrescriptionsAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof listPrescriptionsService>>>> {
  try {
    await requirePermission(PERMISSIONS.PRESCRIPTIONS_READ_ALL);

    const parsed = prescriptionListQuerySchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await listPrescriptionsService(parsed.data);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function resolvePrescriptionWorkspaceAction(
  input: unknown,
): Promise<
  ActionResult<Awaited<ReturnType<typeof resolvePrescriptionWorkspace>>>
> {
  try {
    await requirePermission(PERMISSIONS.PRESCRIPTIONS_ISSUE);

    const parsed = z
      .object({ appointmentId: objectIdSchema })
      .safeParse(input);

    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await resolvePrescriptionWorkspace(parsed.data.appointmentId);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function getPrescriptionDetailAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof getPrescriptionDetail>>>> {
  try {
    await requirePermission(PERMISSIONS.PRESCRIPTIONS_READ_ALL);

    const parsed = z.object({ id: objectIdSchema }).safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await getPrescriptionDetail(parsed.data.id);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function savePrescriptionAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof savePrescriptionForAppointment>>>> {
  try {
    const user = await requirePermission(PERMISSIONS.PRESCRIPTIONS_ISSUE);

    const parsed = prescriptionFormSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await savePrescriptionForAppointment(
      parsed.data,
      String(user._id),
    );

    revalidatePrescriptionPaths({
      prescriptionId: data.id,
      patientId: data.patientId,
      appointmentId: data.appointmentId ?? undefined,
    });

    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
