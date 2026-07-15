/**
 * Clerk session shapes used by foundation helpers.
 * App-level Mongo user context is intentionally omitted until sync lands.
 */

export type AuthSession = {
  userId: string;
  sessionId: string | null;
};
