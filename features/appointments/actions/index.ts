"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { getRescheduleAvailability } from "@/features/appointments/services/lifecycle-actions";
import { listAppointments } from "@/features/appointments/services/list-appointments";
import { getAppointmentDetail } from "@/features/appointments/services/list-appointments";
import { performAppointmentAction } from "@/features/appointments/services/lifecycle-actions";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import {
  appointmentActionSchema,
  appointmentListQuerySchema,
  bookingAvailabilityQuerySchema,
} from "@/validators/appointment-booking";
import { objectIdSchema } from "@/validators/common";
import { z } from "zod";

function revalidateAppointments() {
  revalidatePath(ROUTES.DASHBOARD.ROOT);
  revalidatePath(ROUTES.DASHBOARD.APPOINTMENTS);
  revalidatePath(ROUTES.DASHBOARD.PATIENTS);
}

export async function listAppointmentsAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof listAppointments>>>> {
  try {
    await requirePermission(PERMISSIONS.APPOINTMENTS_READ_ALL);

    const parsed = appointmentListQuerySchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await listAppointments(parsed.data);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function getAppointmentDetailAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof getAppointmentDetail>>>> {
  try {
    await requirePermission(PERMISSIONS.APPOINTMENTS_READ_ALL);

    const parsed = z.object({ id: objectIdSchema }).safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await getAppointmentDetail(parsed.data.id);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function performAppointmentActionAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof performAppointmentAction>>>> {
  try {
    const user = await requirePermission(PERMISSIONS.APPOINTMENTS_MANAGE);

    const schema = z.object({
      id: objectIdSchema,
      action: appointmentActionSchema,
    });
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await performAppointmentAction(
      parsed.data.id,
      parsed.data.action,
      String(user._id),
    );
    revalidateAppointments();
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function getRescheduleAvailabilityAction(
  input: unknown,
): Promise<
  ActionResult<Awaited<ReturnType<typeof getRescheduleAvailability>>>
> {
  try {
    await requirePermission(PERMISSIONS.APPOINTMENTS_MANAGE);

    const schema = z.object({
      appointmentId: objectIdSchema,
      date: bookingAvailabilityQuerySchema.shape.date,
    });
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await getRescheduleAvailability(
      parsed.data.appointmentId,
      parsed.data.date,
    );
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
