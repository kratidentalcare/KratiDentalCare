"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { getNotificationCenterData } from "@/features/notifications/services/get-notification-center-data";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/services/mark-notification-read";
import type { NotificationCenterData, NotificationListItem } from "@/features/notifications/types";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import type { ActionResult } from "@/types/api";
import {
  listNotificationsQuerySchema,
  markNotificationReadSchema,
} from "@/validators/notification";

function revalidateNotificationsChrome() {
  revalidatePath(ROUTES.DASHBOARD.ROOT, "layout");
}

/**
 * Refresh Notification Center list + unread count.
 */
export async function listNotificationsAction(
  input?: unknown,
): Promise<ActionResult<NotificationCenterData>> {
  try {
    await requirePermission(PERMISSIONS.DASHBOARD_ADMIN);

    const parsed = listNotificationsQuerySchema.safeParse(input ?? {});
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await getNotificationCenterData(parsed.data.limit);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

/**
 * Mark one notification as read.
 */
export async function markNotificationReadAction(
  input: unknown,
): Promise<ActionResult<NotificationListItem>> {
  try {
    await requirePermission(PERMISSIONS.DASHBOARD_ADMIN);

    const parsed = markNotificationReadSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const updated = await markNotificationRead(parsed.data);
    revalidateNotificationsChrome();
    return toActionResult(successResponse(updated));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsReadAction(): Promise<
  ActionResult<{ modifiedCount: number }>
> {
  try {
    await requirePermission(PERMISSIONS.DASHBOARD_ADMIN);

    const result = await markAllNotificationsRead();
    revalidateNotificationsChrome();
    return toActionResult(successResponse(result));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
