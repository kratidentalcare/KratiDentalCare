"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import {
  archiveMedicine,
  restoreMedicine,
} from "@/features/medicines/services/archive-medicine";
import { createMedicine } from "@/features/medicines/services/create-medicine";
import { searchMedicines } from "@/features/medicines/services/search-medicines";
import { updateMedicine } from "@/features/medicines/services/update-medicine";
import type { MedicineSearchHit } from "@/features/medicines/types";
import {
  authorize,
  PERMISSIONS,
  requirePermission,
} from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import { objectIdSchema } from "@/validators/common";
import {
  createMedicineActionSchema,
  searchMedicinesQuerySchema,
  updateMedicineActionSchema,
} from "@/validators/medicine";

function revalidateMedicines() {
  revalidatePath(ROUTES.DASHBOARD.MEDICINES);
}

export async function searchMedicinesAction(
  input: unknown,
): Promise<ActionResult<MedicineSearchHit[]>> {
  try {
    await authorize({
      permissions: [
        PERMISSIONS.MEDICINES_MANAGE,
        PERMISSIONS.PRESCRIPTIONS_ISSUE,
      ],
      requireAll: false,
    });

    const parsed = searchMedicinesQuerySchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await searchMedicines(parsed.data);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function createMedicineAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.MEDICINES_MANAGE);

    const parsed = createMedicineActionSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const created = await createMedicine(parsed.data, String(user._id));
    revalidateMedicines();
    return toActionResult(successResponse({ id: created.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function updateMedicineAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.MEDICINES_MANAGE);

    const schema = z.object({
      id: objectIdSchema,
      data: updateMedicineActionSchema,
    });
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const updated = await updateMedicine(
      parsed.data.id,
      parsed.data.data,
      String(user._id),
    );
    revalidateMedicines();
    return toActionResult(successResponse({ id: updated.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function archiveMedicineAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.MEDICINES_MANAGE);

    const parsed = z.object({ id: objectIdSchema }).safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const archived = await archiveMedicine(parsed.data.id, String(user._id));
    revalidateMedicines();
    return toActionResult(successResponse({ id: archived.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function restoreMedicineAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.MEDICINES_MANAGE);

    const parsed = z.object({ id: objectIdSchema }).safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const restored = await restoreMedicine(parsed.data.id, String(user._id));
    revalidateMedicines();
    return toActionResult(successResponse({ id: restored.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
