import { NextResponse, type NextRequest } from "next/server";

import { ERROR_CODES } from "@/constants/error-codes";
import { HTTP_STATUS } from "@/constants/http";
import { ROUTES } from "@/constants/routes";
import { createPublicBooking } from "@/features/appointments/services/create-booking";
import {
  errorResponse,
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import { publicBookingSchema } from "@/validators/appointment-booking";

/**
 * POST /api/appointments
 *
 * Public guest booking endpoint.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const result = errorResponse(
      ERROR_CODES.VALIDATION_ERROR,
      "Invalid JSON body",
      { status: HTTP_STATUS.BAD_REQUEST },
    );
    return NextResponse.json(toActionResult(result), { status: result.status });
  }

  const parsed = publicBookingSchema.safeParse(body);
  if (!parsed.success) {
    const result = validationErrorResponse(parsed.error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }

  try {
    const data = await createPublicBooking(parsed.data);
    const result = successResponse(data, { status: 201 });
    return NextResponse.json(
      {
        success: result.success,
        data: result.data,
        meta: {
          ...result.meta,
          endpoint: ROUTES.API.APPOINTMENTS,
        },
      },
      { status: result.status },
    );
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}
