import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { listPatients } from "@/features/patients/services/list-patients";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import { patientListQuerySchema } from "@/validators/patient";

/**
 * GET /api/dashboard/patients
 */
export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.PATIENTS_READ);

    const { searchParams } = request.nextUrl;
    const parsed = patientListQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });

    if (!parsed.success) {
      const result = validationErrorResponse(parsed.error);
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    const data = await listPatients(parsed.data);
    const result = successResponse(data.items, {
      pagination: data.pagination,
    });

    return NextResponse.json(
      {
        success: result.success,
        data: result.data,
        meta: {
          ...result.meta,
          endpoint: ROUTES.API.DASHBOARD_PATIENTS,
        },
      },
      { status: result.status },
    );
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}
