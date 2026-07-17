import { NextResponse, type NextRequest } from "next/server";

import { getPatientProfile } from "@/features/patients/services/get-patient-profile";
import { updatePatientContact } from "@/features/patients/services/update-patient-contact";
import { updatePatientActiveStatus } from "@/features/patients/services/update-patient-status";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import {
  patientIdParamSchema,
  updatePatientActiveStatusSchema,
  updatePatientContactSchema,
} from "@/validators/patient";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patientPatchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("updateContact"),
    data: updatePatientContactSchema,
  }),
  z.object({
    action: z.literal("updateStatus"),
    data: updatePatientActiveStatusSchema,
  }),
]);

/**
 * GET /api/dashboard/patients/[id]
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requirePermission(PERMISSIONS.PATIENTS_READ);

    const params = await context.params;
    const parsed = patientIdParamSchema.safeParse(params);
    if (!parsed.success) {
      const result = validationErrorResponse(parsed.error);
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    const historyPage = request.nextUrl.searchParams.get("historyPage");
    const historyLimit = request.nextUrl.searchParams.get("historyLimit");

    const data = await getPatientProfile(
      parsed.data.id,
      historyPage ? Number(historyPage) : undefined,
      historyLimit ? Number(historyLimit) : undefined,
    );
    const result = successResponse(data);
    return NextResponse.json(toActionResult(result), { status: result.status });
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}

/**
 * PATCH /api/dashboard/patients/[id]
 * Supports contact edits and Active / Inactive status changes only.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requirePermission(PERMISSIONS.PATIENTS_MANAGE);

    const params = await context.params;
    const idParsed = patientIdParamSchema.safeParse(params);
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
        patientPatchSchema.safeParse({}).error!,
      );
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    const actionParsed = patientPatchSchema.safeParse(body);
    if (!actionParsed.success) {
      const result = validationErrorResponse(actionParsed.error);
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    if (actionParsed.data.action === "updateContact") {
      const data = await updatePatientContact(
        idParsed.data.id,
        actionParsed.data.data,
      );
      const result = successResponse(data);
      return NextResponse.json(toActionResult(result), {
        status: result.status,
      });
    }

    const data = await updatePatientActiveStatus(
      idParsed.data.id,
      actionParsed.data.data,
    );
    const result = successResponse(data);
    return NextResponse.json(toActionResult(result), { status: result.status });
  } catch (error) {
    const result = fromUnknownError(error);
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}
