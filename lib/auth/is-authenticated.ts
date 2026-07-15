import "server-only";

import { getSession } from "./get-session";

/**
 * Whether the request has a valid Clerk session.
 *
 * Does **not** verify Mongo sync, role, or `isActive`.
 * Use {@link getActiveCurrentUser} / `isAdmin` when app-user state matters.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
