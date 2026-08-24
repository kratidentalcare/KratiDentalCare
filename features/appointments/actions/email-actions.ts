"use server";

import {
  executeEmailCancelAction,
  executeEmailRescheduleAction,
  getEmailRescheduleAvailability,
} from "@/features/appointments/services/email-actions";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import { civilDateSchema } from "@/validators/availability";
import { z } from "zod";

const tokenSchema = z.string().trim().min(16).max(256);

export async function confirmEmailCancelAction(input: unknown): Promise<
  ActionResult<Awaited<ReturnType<typeof executeEmailCancelAction>>>
> {
  try {
    const parsed = z
      .object({
        token: tokenSchema,
        cancellationReason: z.string().trim().max(500).optional(),
      })
      .safeParse(input);

    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await executeEmailCancelAction(
      parsed.data.token,
      parsed.data.cancellationReason,
    );
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function getEmailRescheduleAvailabilityAction(
  input: unknown,
): Promise<
  ActionResult<Awaited<ReturnType<typeof getEmailRescheduleAvailability>>>
> {
  try {
    const parsed = z
      .object({
        token: tokenSchema,
        date: civilDateSchema,
      })
      .safeParse(input);

    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await getEmailRescheduleAvailability(
      parsed.data.token,
      parsed.data.date,
    );
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function confirmEmailRescheduleAction(input: unknown): Promise<
  ActionResult<Awaited<ReturnType<typeof executeEmailRescheduleAction>>>
> {
  try {
    const parsed = z
      .object({
        token: tokenSchema,
        date: civilDateSchema,
        startAt: z.string().datetime({ offset: true }),
        endAt: z.string().datetime({ offset: true }),
      })
      .safeParse(input);

    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await executeEmailRescheduleAction(parsed.data.token, {
      date: parsed.data.date,
      startAt: parsed.data.startAt,
      endAt: parsed.data.endAt,
    });
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
