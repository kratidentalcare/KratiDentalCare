"use server";

import { createContactMessage } from "@/features/contact/services/create-contact-message";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import { createContactMessageSchema } from "@/validators/contact-message";

/**
 * Public contact form submit — no auth required.
 */
export async function submitContactMessageAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createContactMessageSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const created = await createContactMessage(parsed.data);
    return toActionResult(successResponse({ id: created.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
