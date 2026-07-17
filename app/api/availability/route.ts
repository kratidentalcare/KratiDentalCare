import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import {
  fromUnknownError,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateAvailableSlots } from "@/features/scheduling/services/generate-available-slots";
import { generateAvailableSlotsQuerySchema } from "@/validators/availability";

/**
 * GET /api/availability?date=YYYY-MM-DD
 *
 * Public-facing availability endpoint for future patient booking UI.
 * Uses the same `generateAvailableSlots` engine as the admin live preview.
 *
 * Optional query:
 * - doctorId — future doctor-scoped capacity
 * - durationMinutes — future service-specific duration
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = generateAvailableSlotsQuerySchema.safeParse({
    date: searchParams.get("date") ?? undefined,
    doctorId: searchParams.get("doctorId") ?? undefined,
    durationMinutes: searchParams.get("durationMinutes")
      ? Number(searchParams.get("durationMinutes"))
      : undefined,
    includePastTimes: searchParams.get("includePastTimes") === "true",
  });

  if (!parsed.success) {
    const result = validationErrorResponse(parsed.error);
    return NextResponse.json(result, { status: result.status });
  }

  try {
    const data = await generateAvailableSlots(parsed.data.date, {
      doctorId: parsed.data.doctorId,
      durationMinutes: parsed.data.durationMinutes,
      includePastTimes: parsed.data.includePastTimes,
    });

    const result = successResponse(data);
    return NextResponse.json(
      {
        success: result.success,
        data: result.data,
        meta: {
          ...result.meta,
          endpoint: ROUTES.API.AVAILABILITY,
        },
      },
      { status: result.status },
    );
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(result, { status: result.status });
  }
}
