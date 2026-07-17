import { NextResponse, type NextRequest } from "next/server";

import { getAppointmentDetail } from "@/features/appointments/services/list-appointments";
import { performAppointmentAction } from "@/features/appointments/services/lifecycle-actions";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import {
  appointmentActionSchema,
  appointmentIdParamSchema,
} from "@/validators/appointment-booking";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/dashboard/appointments/[id]
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await requirePermission(PERMISSIONS.APPOINTMENTS_READ_ALL);

    const params = await context.params;
    const parsed = appointmentIdParamSchema.safeParse(params);
    if (!parsed.success) {
      const result = validationErrorResponse(parsed.error);
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    const data = await getAppointmentDetail(parsed.data.id);
    const result = successResponse(data);
    return NextResponse.json(toActionResult(result), { status: result.status });
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}

/**
 * PATCH /api/dashboard/appointments/[id]
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await requirePermission(PERMISSIONS.APPOINTMENTS_MANAGE);

    const params = await context.params;
    const idParsed = appointmentIdParamSchema.safeParse(params);
    if (!idParsed.success) {
      const result = validationErrorResponse(idParsed.error);
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const result = validationErrorResponse(
        appointmentActionSchema.safeParse({}).error!,
      );
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    const actionParsed = appointmentActionSchema.safeParse(body);
    if (!actionParsed.success) {
      const result = validationErrorResponse(actionParsed.error);
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    const data = await performAppointmentAction(
      idParsed.data.id,
      actionParsed.data,
      String(user._id),
    );
    const result = successResponse(data);
    return NextResponse.json(toActionResult(result), { status: result.status });
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}
