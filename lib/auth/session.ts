import "server-only";

import { auth } from "@clerk/nextjs/server";

import { requireClerkEnv } from "@/config/env";
import { UnauthorizedError } from "@/lib/errors";

import type { AuthSession } from "./types";

function assertClerkConfigured(): void {
  requireClerkEnv();
}

/**
 * Soft read of the current Clerk session (no throw, no redirect).
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  assertClerkConfigured();
  const { userId, sessionId } = await auth();
  if (!userId) {
    return null;
  }

  return {
    userId,
    sessionId: sessionId ?? null,
  };
}

/**
 * Returns the Clerk user id when a session exists; otherwise `null`.
 */
export async function getClerkUserId(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.userId ?? null;
}

/**
 * Whether the request has a valid Clerk session.
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getClerkUserId();
  return userId !== null;
}

/**
 * Requires a Clerk session for Server Actions / Route Handlers.
 * Throws `UnauthorizedError` (maps to `UNAUTHORIZED`) when missing.
 *
 * Prefer `requireAuthRedirect()` in Server Components / layouts
 * when an unauthenticated visitor should be sent to sign-in.
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession();

  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
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
