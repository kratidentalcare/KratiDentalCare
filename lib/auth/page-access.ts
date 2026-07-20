import "server-only";

import { redirect } from "next/navigation";

import {
  AUTH_STATUS_REASONS,
  type AuthStatusReason,
} from "@/constants/auth-status";
import { ERROR_CODES } from "@/constants/error-codes";
import { ROUTES } from "@/constants/routes";
import {
  DomainError,
  ForbiddenError,
  UnauthorizedError,
  isAppError,
} from "@/lib/errors";

import { requireAppUser } from "./require-auth";
import { requireAdmin, requirePatient } from "./require-role";
import { requireAuthRedirect } from "./session";
import type { AppUser } from "./sync-user";
import type { SyncUserOptions } from "./types";

export type PageAccessOptions = SyncUserOptions & {
  /**
   * Path to return to after sign-in when the session is missing.
   * Defaults to home — callers should pass the protected route path.
   */
  returnPath?: string;
};

function buildSignInRedirectUrl(returnPath: string): string {
  const params = new URLSearchParams({
    redirect_url: returnPath,
  });
  return `${ROUTES.SIGN_IN}?${params.toString()}`;
}

function buildAuthStatusUrl(reason: AuthStatusReason): string {
  const params = new URLSearchParams({ reason });
  return `${ROUTES.AUTH.STATUS}?${params.toString()}`;
}

/**
 * Maps hard authz failures to stable UX redirects.
 * Unknown / infrastructure errors are rethrown for the nearest error boundary.
 */
function redirectForPageAccessFailure(
  error: unknown,
  returnPath: string,
): never {
  if (error instanceof UnauthorizedError) {
    redirect(buildSignInRedirectUrl(returnPath));
  }

  if (error instanceof ForbiddenError) {
    redirect(buildAuthStatusUrl(AUTH_STATUS_REASONS.FORBIDDEN));
  }

  if (error instanceof DomainError) {
    if (error.code === ERROR_CODES.ACCOUNT_DISABLED) {
      redirect(buildAuthStatusUrl(AUTH_STATUS_REASONS.ACCOUNT_DISABLED));
    }

    if (error.code === ERROR_CODES.USER_NOT_SYNCED) {
      redirect(buildAuthStatusUrl(AUTH_STATUS_REASONS.USER_NOT_SYNCED));
    }
  }

  // Fail closed for unexpected AppErrors that still signal auth problems.
  if (isAppError(error) && error.code === ERROR_CODES.UNAUTHORIZED) {
    redirect(buildSignInRedirectUrl(returnPath));
  }

  // A uniqueness conflict during sync (e.g. the Clerk email collides with an
  // existing / soft-deleted Mongo row) leaves the session without a usable
  // app profile — surface the stable "account unavailable" status instead of
  // bubbling a raw 500 to the error boundary.
  if (isAppError(error) && error.code === ERROR_CODES.CONFLICT) {
    redirect(buildAuthStatusUrl(AUTH_STATUS_REASONS.USER_NOT_SYNCED));
  }

  throw error;
}

/**
 * Requires a Clerk session + active Mongo app user for page layouts.
 * Guests are redirected to Sign In; disabled / unsynced accounts get status UX.
 */
export async function requireAppUserPage(
  options: PageAccessOptions = {},
): Promise<AppUser> {
  const returnPath = options.returnPath ?? ROUTES.HOME;
  const syncOptions: SyncUserOptions = {
    touchLastLogin: options.touchLastLogin,
  };

  await requireAuthRedirect();

  try {
    return await requireAppUser(syncOptions);
  } catch (error) {
    return redirectForPageAccessFailure(error, returnPath);
  }
}

/**
 * Admin console page gate — session + active Mongo user + `role === admin`.
 */
export async function requireAdminPage(
  options: PageAccessOptions = {},
): Promise<AppUser> {
  const returnPath = options.returnPath ?? ROUTES.DASHBOARD.ROOT;
  const syncOptions: SyncUserOptions = {
    touchLastLogin: options.touchLastLogin,
  };

  await requireAuthRedirect();

  try {
    return await requireAdmin(syncOptions);
  } catch (error) {
    return redirectForPageAccessFailure(error, returnPath);
  }
}

/**
 * Patient portal page gate — session + active Mongo user + `role === patient`.
 */
export async function requirePatientPage(
  options: PageAccessOptions = {},
): Promise<AppUser> {
  const returnPath = options.returnPath ?? ROUTES.PATIENT.ROOT;
  const syncOptions: SyncUserOptions = {
    touchLastLogin: options.touchLastLogin,
  };

  await requireAuthRedirect();

  try {
    return await requirePatient(syncOptions);
  } catch (error) {
    return redirectForPageAccessFailure(error, returnPath);
  }
}
