import "server-only";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import { ROUTES } from "@/constants/routes";
import { toNotificationListItem } from "@/features/notifications/services/mappers";
import type { NotificationListItem } from "@/features/notifications/types";
import { connect } from "@/lib/db";
import { ValidationError } from "@/lib/errors";
import {
  Notification,
  type LeanNotification,
} from "@/models/notification";
import {
  createNotificationSchema,
  type CreateNotificationInput,
} from "@/validators/notification";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

/**
 * Centralized in-app notification writer.
 *
 * All modules should create notifications through this function (or the
 * domain helpers that wrap it) so titles, types, and idempotency stay consistent.
 *
 * Duplicate `idempotencyKey` values are ignored (safe for retries).
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationListItem | null> {
  const parsed = createNotificationSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid notification",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  const data = parsed.data;
  await connect();

  try {
    const created = await Notification.create({
      type: data.type,
      event: data.event,
      title: data.title,
      description: data.description,
      href: data.href ?? null,
      isRead: false,
      readAt: null,
      relatedEntityType: data.relatedEntityType ?? null,
      relatedEntityId: data.relatedEntityId
        ? new Types.ObjectId(data.relatedEntityId)
        : null,
      recipientUserId: data.recipientUserId
        ? new Types.ObjectId(data.recipientUserId)
        : null,
      metadata: data.metadata ?? null,
      idempotencyKey: data.idempotencyKey ?? null,
    });

    revalidatePath(ROUTES.DASHBOARD.ROOT, "layout");

    return toNotificationListItem(
      created.toObject() as LeanNotification,
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return null;
    }
    throw error;
  }
}
