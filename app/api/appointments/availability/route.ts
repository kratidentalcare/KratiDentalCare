import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { getBookingAvailability } from "@/features/appointments/services/booking-availability";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import { bookingAvailabilityQuerySchema } from "@/validators/appointment-booking";

/**
 * GET /api/appointments/availability?date=YYYY-MM-DD
 *
 * Public booking availability with clinic policy and default doctor applied.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = bookingAvailabilityQuerySchema.safeParse({
    date: searchParams.get("date") ?? undefined,
  });

  if (!parsed.success) {
    const result = validationErrorResponse(parsed.error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }

  try {
    const data = await getBookingAvailability(parsed.data.date);
    const result = successResponse(data);
    return NextResponse.json(
      {
        success: result.success,
        data: result.data,
        meta: {
          ...result.meta,
          endpoint: ROUTES.API.APPOINTMENTS_AVAILABILITY,
        },
      },
      { status: result.status },
    );
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}
