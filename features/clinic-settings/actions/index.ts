"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import {
  updateClinicAvailability,
  updateClinicSettings,
} from "@/features/scheduling/services/clinic-settings";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import {
  updateClinicAvailabilitySchema,
  updateClinicSettingsSchema,
} from "@/validators/clinic-settings";

function revalidateClinicSettingsSurfaces() {
  revalidatePath(ROUTES.DASHBOARD.SETTINGS);
  revalidatePath(ROUTES.DASHBOARD.SCHEDULING);
  revalidatePath(ROUTES.PUBLIC.HOME);
  revalidatePath(ROUTES.PUBLIC.BOOK);
  // Layout-level Footer is shared across public routes.
  revalidatePath("/", "layout");
}

/**
 * Update clinic identity, contact, social, and footer link settings.
 */
export async function updateClinicSettingsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const user = await requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE);

    const parsed = updateClinicSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    await updateClinicSettings(parsed.data, String(user._id));
    revalidateClinicSettingsSurfaces();
    return toActionResult(successResponse({ ok: true as const }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

/**
 * Update default doctor from Clinic Settings (same DB field as Scheduling).
 */
export async function updateDefaultDoctorAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const user = await requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE);

    const parsed = updateClinicAvailabilitySchema
      .pick({ defaultDoctorId: true })
      .safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    await updateClinicAvailability(parsed.data, String(user._id));
    revalidateClinicSettingsSurfaces();
    return toActionResult(successResponse({ ok: true as const }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
