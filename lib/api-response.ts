import type { ZodError } from "zod";

import { ERROR_CODES } from "@/constants/error-codes";
import { HTTP_STATUS, type HttpStatus } from "@/constants/http";
import { isAppError } from "@/lib/errors";
import type {
  ActionResult,
  ActionResultWithStatus,
  ApiFailure,
  ApiSuccess,
  FieldError,
  PaginationMeta,
} from "@/types/api";

/**
 * Creates a correlation id for logs and API meta.
 */
export function createRequestId(): string {
  return `req_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

function ensureRequestId(requestId?: string): string {
  return requestId ?? createRequestId();
}

/**
 * Builds a successful API / Server Action envelope.
 */
export function successResponse<T>(
  data: T,
  options?: {
    requestId?: string;
    pagination?: PaginationMeta;
    status?: HttpStatus;
  },
): ActionResultWithStatus<T> {
  const result: ApiSuccess<T> = {
    success: true,
    data,
    meta: {
      requestId: ensureRequestId(options?.requestId),
      ...(options?.pagination ? { pagination: options.pagination } : {}),
    },
  };

  return {
    ...result,
    status: options?.status ?? HTTP_STATUS.OK,
  };
}

/**
 * Builds a failed API / Server Action envelope.
 */
export function errorResponse(
  code: string,
  message: string,
  options?: {
    requestId?: string;
    details?: FieldError[];
    status?: HttpStatus;
  },
): ActionResultWithStatus<never> {
  const result: ApiFailure = {
    success: false,
    error: {
      code,
      message,
      ...(options?.details?.length ? { details: options.details } : {}),
    },
    meta: {
      requestId: ensureRequestId(options?.requestId),
    },
  };

  return {
    ...result,
    status: options?.status ?? HTTP_STATUS.BAD_REQUEST,
  };
}

/**
 * Maps a ZodError into the standard validation envelope.
 */
export function validationErrorResponse(
  error: ZodError,
  requestId?: string,
): ActionResultWithStatus<never> {
  const details: FieldError[] = error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
  }));

  return errorResponse(ERROR_CODES.VALIDATION_ERROR, "Request validation failed", {
    requestId,
    details,
    status: HTTP_STATUS.BAD_REQUEST,
  });
}

/**
 * Maps unknown thrown values into a safe ActionResult.
 * Unexpected errors become INTERNAL_ERROR (no stack to clients).
 */
export function fromUnknownError(
  error: unknown,
  requestId?: string,
): ActionResultWithStatus<never> {
  if (isAppError(error)) {
    return errorResponse(error.code, error.message, {
      requestId,
      details: error.details,
      status: error.status,
    });
  }

  return errorResponse(
    ERROR_CODES.INTERNAL_ERROR,
    "An unexpected error occurred",
    {
      requestId,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    },
  );
}

/**
 * Narrow helper for consumers that do not need HTTP status.
 */
export function toActionResult<T>(
  result: ActionResultWithStatus<T>,
): ActionResult<T> {
  const { status: _status, ...rest } = result;
  return rest;
}
