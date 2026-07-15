import "server-only";

import { auth } from "@clerk/nextjs/server";

import { requireClerkEnv } from "@/config/env";

import {
  getAuthSession,
  getSession,
  getSessionOrThrow,
} from "./get-session";
import type { AuthSession } from "./types";

export { getAuthSession, getSession, getSessionOrThrow };

function assertClerkConfigured(): void {
  requireClerkEnv();
}

/**
 * Returns the Clerk user id when a session exists; otherwise `null`.
 */
export async function getClerkUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}

/**
 * Requires a Clerk session for Server Actions / Route Handlers.
 * Throws `UnauthorizedError` (maps to `UNAUTHORIZED`) when missing.
 *
 * Prefer `requireAuthRedirect()` in Server Components / layouts
 * when an unauthenticated visitor should be sent to sign-in.
 */
export async function requireAuth(): Promise<AuthSession> {
  return getSessionOrThrow();
}

/**
 * Requires a Clerk session and redirects to sign-in when absent.
 * Uses Clerk's App Router `auth.protect()` (document requests → redirect).
 */
export async function requireAuthRedirect(): Promise<AuthSession> {
  assertClerkConfigured();
  const { userId, sessionId } = await auth.protect();
  return {
    userId,
    sessionId: sessionId ?? null,
  };
}
