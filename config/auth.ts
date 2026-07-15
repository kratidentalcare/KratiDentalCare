import { ROUTES } from "@/constants/routes";

/**
 * Authentication route and path-matching configuration.
 * Role checks and Mongo user resolution belong in a later phase.
 */

export const AUTH_CONFIG = {
  signInUrl: ROUTES.SIGN_IN,
  signUpUrl: ROUTES.SIGN_UP,
  /** After sign-in when no return URL is present (role redirect comes later). */
  afterSignInUrl: ROUTES.HOME,
  afterSignUpUrl: ROUTES.HOME,
  /** URL path prefixes that require a Clerk session. */
  protectedPathPrefixes: [ROUTES.PATIENT.ROOT, ROUTES.ADMIN.ROOT] as const,
  /** Prefixes that must stay public (webhooks, static marketing). */
  publicPathPrefixes: [ROUTES.API.CLERK_WEBHOOK] as const,
} as const;

/**
 * True when the pathname is under a session-protected tree
 * (`/patient`, `/admin`) and is not an explicit public exception.
 */
export function isProtectedPath(pathname: string): boolean {
  if (isPublicAuthException(pathname)) {
    return false;
  }

  return AUTH_CONFIG.protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPublicAuthException(pathname: string): boolean {
  if (
    pathname === AUTH_CONFIG.signInUrl ||
    pathname.startsWith(`${AUTH_CONFIG.signInUrl}/`) ||
    pathname === AUTH_CONFIG.signUpUrl ||
    pathname.startsWith(`${AUTH_CONFIG.signUpUrl}/`)
  ) {
    return true;
  }

  return AUTH_CONFIG.publicPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
