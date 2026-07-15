/**
 * Clerk session identity helpers only.
 * Mongo user sync, roles, and ownership checks belong in a later phase.
 */

export {
  getAuthSession,
  getClerkUserId,
  isAuthenticated,
  requireAuth,
  requireAuthRedirect,
} from "./session";

export type { AuthSession } from "./types";
