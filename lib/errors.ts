import { ERROR_CODES, type ErrorCode } from "@/constants/error-codes";
import { HTTP_STATUS, type HttpStatus } from "@/constants/http";
import type { FieldError } from "@/types/api";

type AppErrorOptions = {
  code: ErrorCode | (string & {});
  message: string;
  status: HttpStatus;
  details?: FieldError[];
  cause?: unknown;
};

/**
 * Base application error with stable API `code` and HTTP status hint.
 */
export class AppError extends Error {
  readonly code: ErrorCode | (string & {});
  readonly status: HttpStatus;
  readonly details?: FieldError[];

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Request validation failed", details?: FieldError[]) {
    super({
      code: ERROR_CODES.VALIDATION_ERROR,
      message,
      status: HTTP_STATUS.BAD_REQUEST,
      details,
    });
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super({
      code: ERROR_CODES.UNAUTHORIZED,
      message,
      status: HTTP_STATUS.UNAUTHORIZED,
    });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super({
      code: ERROR_CODES.FORBIDDEN,
      message,
      status: HTTP_STATUS.FORBIDDEN,
    });
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super({
      code: ERROR_CODES.NOT_FOUND,
      message,
      status: HTTP_STATUS.NOT_FOUND,
    });
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(
    message = "Resource conflict",
    code: ErrorCode | (string & {}) = ERROR_CODES.CONFLICT,
  ) {
    super({
      code,
      message,
      status: HTTP_STATUS.CONFLICT,
    });
    this.name = "ConflictError";
  }
}

export class DomainError extends AppError {
  constructor(
    code: ErrorCode | (string & {}),
    message: string,
    status: HttpStatus = HTTP_STATUS.UNPROCESSABLE_ENTITY,
  ) {
    super({ code, message, status });
    this.name = "DomainError";
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super({
      code: ERROR_CODES.CONFIGURATION_ERROR,
      message,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
    this.name = "ConfigurationError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
