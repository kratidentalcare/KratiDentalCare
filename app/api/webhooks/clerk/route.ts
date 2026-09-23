import { verifyWebhook, type WebhookEvent } from "@clerk/nextjs/webhooks";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { ERROR_CODES } from "@/constants/error-codes";
import { HTTP_STATUS } from "@/constants/http";
import { ROUTES } from "@/constants/routes";
import {
  errorResponse,
  successResponse,
  toActionResult,
} from "@/lib/api-response";
import { toClerkWebhookUserSyncInput } from "@/lib/auth/map-clerk-webhook-user";
import { deactivateUserByClerkId, syncUser } from "@/lib/auth/sync-user";
import { isAppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const ACKNOWLEDGED_SYNC_CODES = new Set<string>([
  ERROR_CODES.ACCOUNT_DISABLED,
  ERROR_CODES.CONFLICT,
  ERROR_CODES.VALIDATION_ERROR,
]);

function jsonResult(
  result: ReturnType<typeof successResponse<{ received: true }>>,
) {
  return NextResponse.json(toActionResult(result), { status: result.status });
}

function isUserUpsert(
  event: WebhookEvent,
): event is Extract<WebhookEvent, { type: "user.created" | "user.updated" }> {
  return event.type === "user.created" || event.type === "user.updated";
}

/**
 * Non-retryable identity outcomes (disabled account, email clash, missing email)
 * are acknowledged so Clerk does not retry forever.
 */
function isAcknowledgedSyncError(error: unknown): boolean {
  return isAppError(error) && ACKNOWLEDGED_SYNC_CODES.has(error.code);
}

/**
 * POST /api/webhooks/clerk
 *
 * Svix-signed Clerk user lifecycle. Session auth is not used.
 */
export async function POST(request: Request) {
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim()) {
    logger.error("Clerk webhook signing secret is not configured");
    const result = errorResponse(
      ERROR_CODES.CONFIGURATION_ERROR,
      "Webhook signing secret is not configured",
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
    return NextResponse.json(toActionResult(result), { status: result.status });
  }

  let event: WebhookEvent;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    logger.warn("Clerk webhook signature verification failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    const result = errorResponse(
      ERROR_CODES.UNAUTHORIZED,
      "Webhook signature verification failed",
      { status: HTTP_STATUS.BAD_REQUEST },
    );
    return NextResponse.json(toActionResult(result), { status: result.status });
  }

  try {
    if (isUserUpsert(event)) {
      await syncUser(toClerkWebhookUserSyncInput(event.data));
      revalidatePath(ROUTES.DASHBOARD.USERS);
    } else if (event.type === "user.deleted") {
      const clerkId = event.data.id;

      if (!clerkId) {
        const result = errorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          "Clerk user id is required",
          { status: HTTP_STATUS.BAD_REQUEST },
        );
        return NextResponse.json(toActionResult(result), {
          status: result.status,
        });
      }

      const deactivated = await deactivateUserByClerkId(clerkId);
      if (deactivated) {
        revalidatePath(ROUTES.DASHBOARD.USERS);
      }
    }

    return jsonResult(successResponse({ received: true }));
  } catch (error) {
    if (isAcknowledgedSyncError(error)) {
      logger.warn("Clerk webhook sync acknowledged without retry", {
        eventType: event.type,
        code: isAppError(error) ? error.code : ERROR_CODES.INTERNAL_ERROR,
      });
      return jsonResult(successResponse({ received: true }));
    }

    logger.error("Clerk webhook persist failed", error, {
      eventType: event.type,
    });
    const result = errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to persist Clerk user event",
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
    return NextResponse.json(toActionResult(result), { status: result.status });
  }
}
