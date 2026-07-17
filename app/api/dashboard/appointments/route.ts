import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { listAppointments } from "@/features/appointments/services/list-appointments";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import { appointmentListQuerySchema } from "@/validators/appointment-booking";

/**
 * GET /api/dashboard/appointments
 */
export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.APPOINTMENTS_READ_ALL);

    const { searchParams } = request.nextUrl;
    const parsed = appointmentListQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      date: searchParams.get("date") ?? undefined,
    });

    if (!parsed.success) {
      const result = validationErrorResponse(parsed.error);
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    const data = await listAppointments(parsed.data);
    const result = successResponse(data.items, {
      pagination: data.pagination,
    });

    return NextResponse.json(
      {
        success: result.success,
        data: result.data,
        meta: {
          ...result.meta,
          endpoint: ROUTES.API.DASHBOARD_APPOINTMENTS,
        },
      },
      { status: result.status },
    );
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}
