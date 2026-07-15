/**
 * Auth helpers — Clerk session identity + Mongo user synchronization.
 *
 * Role guards / ownership checks belong in a later phase.
 */

export {
  getAuthSession,
  getClerkUserId,
  isAuthenticated,
  requireAuth,
  requireAuthRedirect,
} from "./session";

export {
  getAppUser,
  getCurrentUser,
  requireCurrentUser,
} from "./current-user";

export {
  syncClerkUser,
  syncUser,
  toClerkUserSyncInput,
  type AppUser,
} from "./sync-user";

export type {
  AuthSession,
  ClerkUserSyncInput,
  SyncUserOptions,
} from "./types";
