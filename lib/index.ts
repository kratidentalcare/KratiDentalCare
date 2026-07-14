/**
 * Shared library utilities (infrastructure).
 * Prefer importing from specific modules to avoid pulling server-only code into Client Components.
 */

export {
  createRequestId,
  errorResponse,
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "./api-response";

export {
  AppError,
  ConfigurationError,
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  isAppError,
} from "./errors";

export { logger } from "./logger";

export { cn } from "./utils";
