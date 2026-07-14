import type { ErrorCode } from "@/constants/error-codes";
import type { HttpStatus } from "@/constants/http";

/**
 * Field-level validation issue (API envelope `error.details`).
 */
export type FieldError = {
  field: string;
  message: string;
};

/**
 * Standard error payload returned to clients.
 */
export type ApiErrorBody = {
  code: ErrorCode | (string & {});
  message: string;
  details?: FieldError[];
};

/**
 * Pagination metadata for list responses.
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * Response metadata shared by success and error envelopes.
 */
export type ApiMeta = {
  requestId: string;
  pagination?: PaginationMeta;
};

/**
 * Successful API / action envelope.
 */
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: ApiMeta;
};

/**
 * Failed API / action envelope.
 */
export type ApiFailure = {
  success: false;
  error: ApiErrorBody;
  meta: ApiMeta;
};

/**
 * Discriminated union used by Route Handlers and Server Actions.
 */
export type ActionResult<T> = ApiSuccess<T> | ApiFailure;

/**
 * Optional HTTP status hint for Route Handlers mapping ActionResult → Response.
 */
export type ActionResultWithStatus<T> = ActionResult<T> & {
  status: HttpStatus;
};
