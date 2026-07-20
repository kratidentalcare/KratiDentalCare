"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateAvailableSlots } from "@/features/scheduling/services/generate-available-slots";
import { updateClinicAvailability } from "@/features/scheduling/services/clinic-settings";
import {
  createHoliday,
  deleteHoliday,
  updateHoliday,
} from "@/features/scheduling/services/holidays";
import {
  createScheduleOverride,
  deleteScheduleOverride,
} from "@/features/scheduling/services/overrides";
import type { AvailabilityResult } from "@/features/scheduling/types";
import type { ActionResult } from "@/types/api";
import { generateAvailableSlotsQuerySchema } from "@/validators/availability";
import { updateClinicAvailabilitySchema } from "@/validators/clinic-settings";
import {
  createHolidayActionSchema,
  updateHolidayActionSchema,
} from "@/validators/holiday";
import { objectIdSchema } from "@/validators/common";
import { createScheduleOverrideActionSchema } from "@/validators/schedule-override";
import { z } from "zod";

function revalidateScheduling() {
  revalidatePath(ROUTES.DASHBOARD.SCHEDULING);
  revalidatePath(ROUTES.DASHBOARD.SETTINGS);
  // Footer working-hours display depends on clinic availability.
  revalidatePath(ROUTES.PUBLIC.HOME);
  revalidatePath("/", "layout");
}

export async function previewAvailableSlotsAction(
  input: unknown,
): Promise<ActionResult<AvailabilityResult>> {
  try {
    await requirePermission(PERMISSIONS.SLOTS_READ);

    const parsed = generateAvailableSlotsQuerySchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await generateAvailableSlots(parsed.data.date, {
      durationMinutes: parsed.data.durationMinutes,
      doctorId: parsed.data.doctorId,
      includePastTimes: parsed.data.includePastTimes,
    });

    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function updateClinicAvailabilityAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const user = await requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE);

    const parsed = updateClinicAvailabilitySchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    await updateClinicAvailability(parsed.data, String(user._id));
    revalidateScheduling();
    return toActionResult(successResponse({ ok: true as const }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function createHolidayAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE);

    const parsed = createHolidayActionSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const created = await createHoliday(parsed.data, String(user._id));
    revalidateScheduling();
    return toActionResult(successResponse({ id: created.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function updateHolidayAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE);

    const schema = z.object({
      id: objectIdSchema,
      data: updateHolidayActionSchema,
    });
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const updated = await updateHoliday(parsed.data.id, parsed.data.data);
    revalidateScheduling();
    return toActionResult(successResponse({ id: updated.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function deleteHolidayAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  try {
    await requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE);

    const parsed = z.object({ id: objectIdSchema }).safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    await deleteHoliday(parsed.data.id);
    revalidateScheduling();
    return toActionResult(successResponse({ ok: true as const }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function createScheduleOverrideAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE);

    const parsed = createScheduleOverrideActionSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const created = await createScheduleOverride(parsed.data, String(user._id));
    revalidateScheduling();
    return toActionResult(successResponse({ id: created.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function deleteScheduleOverrideAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  try {
    await requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE);

    const parsed = z.object({ id: objectIdSchema }).safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    await deleteScheduleOverride(parsed.data.id);
    revalidateScheduling();
    return toActionResult(successResponse({ ok: true as const }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
