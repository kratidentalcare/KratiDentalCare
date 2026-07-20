"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { createFaq } from "@/features/faqs/services/create-faq";
import { deleteFaq } from "@/features/faqs/services/delete-faq";
import { listFaqs } from "@/features/faqs/services/list-faqs";
import { toggleFaqVisibility } from "@/features/faqs/services/toggle-faq-visibility";
import { updateFaq } from "@/features/faqs/services/update-faq";
import type { FaqListItem } from "@/features/faqs/types";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import { objectIdSchema } from "@/validators/common";
import {
  createFaqActionSchema,
  updateFaqActionSchema,
} from "@/validators/faq";

function revalidateFaqs() {
  revalidatePath(ROUTES.DASHBOARD.FAQS);
  revalidatePath(ROUTES.PUBLIC.HOME);
}

export async function listFaqsAction(): Promise<
  ActionResult<FaqListItem[]>
> {
  try {
    await requirePermission(PERMISSIONS.WEBSITE_MANAGE);
    const data = await listFaqs();
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function createFaqAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.WEBSITE_MANAGE);

    const parsed = createFaqActionSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const created = await createFaq(parsed.data, String(user._id));
    revalidateFaqs();
    return toActionResult(successResponse({ id: created.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function updateFaqAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission(PERMISSIONS.WEBSITE_MANAGE);

    const schema = z.object({
      id: objectIdSchema,
      data: updateFaqActionSchema,
    });
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const updated = await updateFaq(
      parsed.data.id,
      parsed.data.data,
      String(user._id),
    );
    revalidateFaqs();
    return toActionResult(successResponse({ id: updated.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function deleteFaqAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  try {
    await requirePermission(PERMISSIONS.WEBSITE_MANAGE);

    const parsed = z.object({ id: objectIdSchema }).safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    await deleteFaq(parsed.data.id);
    revalidateFaqs();
    return toActionResult(successResponse({ ok: true as const }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function toggleFaqVisibilityAction(
  input: unknown,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  try {
    const user = await requirePermission(PERMISSIONS.WEBSITE_MANAGE);

    const schema = z.object({
      id: objectIdSchema,
      isActive: z.boolean(),
    });
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const updated = await toggleFaqVisibility(
      parsed.data.id,
      parsed.data.isActive,
      String(user._id),
    );
    revalidateFaqs();
    return toActionResult(
      successResponse({ id: updated.id, isActive: updated.isActive }),
    );
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
