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
 *
 * Use for optional UI chrome (nav avatar, “Sign in” vs account menu).
 * Prefer {@link getSessionOrThrow} / `requireAuth` when a session is mandatory.
 */
export async function getSession(): Promise<AuthSession | null> {
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
 * Requires a Clerk session; throws `UnauthorizedError` when missing.
 * Does not load or sync the Mongo app user.
 */
export async function getSessionOrThrow(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
}

/** @deprecated Prefer {@link getSession} — kept for call-site continuity. */
export const getAuthSession = getSession;
