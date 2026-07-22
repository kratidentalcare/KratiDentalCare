"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { createContactMessage } from "@/features/contact/services/create-contact-message";
import { deleteContactMessage } from "@/features/contact/services/delete-contact-message";
import { listContactMessages } from "@/features/contact/services/list-contact-messages";
import { updateContactMessageStatus } from "@/features/contact/services/update-contact-message-status";
import type {
  ContactMessageListItem,
  ContactMessageListResult,
} from "@/features/contact/types";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import {
  contactMessageListQuerySchema,
  createContactMessageSchema,
  deleteContactMessageSchema,
  updateContactMessageStatusSchema,
} from "@/validators/contact-message";

function revalidateInbox() {
  revalidatePath(ROUTES.DASHBOARD.INBOX);
  revalidatePath(ROUTES.DASHBOARD.ROOT);
}

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
    revalidateInbox();
    return toActionResult(successResponse({ id: created.id }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

/**
 * Admin Inbox list — paginated + filterable.
 */
export async function listContactMessagesAction(
  input: unknown,
): Promise<ActionResult<ContactMessageListResult>> {
  try {
    await requirePermission(PERMISSIONS.CONTACT_INBOX_MANAGE);

    const parsed = contactMessageListQuerySchema.safeParse(input ?? {});
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await listContactMessages(parsed.data);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

/**
 * Mark inquiry NEW / READ / ARCHIVED.
 */
export async function updateContactMessageStatusAction(
  input: unknown,
): Promise<ActionResult<ContactMessageListItem>> {
  try {
    await requirePermission(PERMISSIONS.CONTACT_INBOX_MANAGE);

    const parsed = updateContactMessageStatusSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const updated = await updateContactMessageStatus(
      parsed.data.id,
      parsed.data.status,
    );
    revalidateInbox();
    return toActionResult(successResponse(updated));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

/**
 * Soft-delete an inquiry (requires confirmation in UI).
 */
export async function deleteContactMessageAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  try {
    await requirePermission(PERMISSIONS.CONTACT_INBOX_MANAGE);

    const parsed = deleteContactMessageSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    await deleteContactMessage(parsed.data.id);
    revalidateInbox();
    return toActionResult(successResponse({ ok: true as const }));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
