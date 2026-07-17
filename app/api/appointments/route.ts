import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { createPublicBooking } from "@/features/appointments/services/create-booking";
import {
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
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid JSON body",
        },
        meta: { requestId: crypto.randomUUID() },
      },
      { status: 400 },
    );
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
