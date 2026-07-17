import { NextResponse, type NextRequest } from "next/server";

import { generatePrescriptionPdf } from "@/features/prescriptions/services/generate-pdf";
import { getPrescriptionDetail } from "@/features/prescriptions/services/save-prescription";
import {
  fromUnknownError,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import { prescriptionIdParamSchema } from "@/validators/prescription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/dashboard/prescriptions/[id]/pdf
 * Streams an A4 PDF by printing the shared preview route in Chromium.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requirePermission(PERMISSIONS.PRESCRIPTIONS_READ_ALL);

    const params = await context.params;
    const parsed = prescriptionIdParamSchema.safeParse(params);
    if (!parsed.success) {
      const result = validationErrorResponse(parsed.error);
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    const dispositionParam =
      request.nextUrl.searchParams.get("disposition") === "inline"
        ? "inline"
        : "attachment";

    const detail = await getPrescriptionDetail(parsed.data.id);
    const printUrl = new URL(
      `/dashboard/prescriptions/${detail.id}/print?pdf=1`,
      request.nextUrl.origin,
    ).toString();

    const pdf = await generatePrescriptionPdf({
      printUrl,
      cookieHeader: request.headers.get("cookie"),
    });

    const filename = `${detail.prescriptionNumber || `prescription-${detail.id}`}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionParam}; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "Content-Length": String(pdf.byteLength),
      },
    });
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}
