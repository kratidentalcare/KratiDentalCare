/**
 * Auth module — Clerk session, Mongo user sync, soft helpers, and authorization.
 *
 * Soft helpers (`getCurrentUser`, `isAdmin`, …) → UI / optional chrome
 * Hard gates (`requireAppUser`, `requireRole`, …) → layouts & Server Actions
 */

// --- Session / soft authentication helpers (Phase 9.4) ---
export { getSession, getSessionOrThrow, getAuthSession } from "./get-session";
export { isAuthenticated } from "./is-authenticated";
export {
  assertActiveAppUser,
  getActiveCurrentUser,
  getAppUser,
  getCurrentUser,
  getCurrentUserOrThrow,
  requireSyncedUser,
} from "./get-current-user";
export { getCurrentUserRole } from "./get-current-user-role";
export { isAdmin } from "./is-admin";
export { isPatient } from "./is-patient";
export { isDoctor } from "./is-doctor";

// --- Clerk session gates (compat) ---
export {
  getClerkUserId,
  requireAuth,
  requireAuthRedirect,
} from "./session";

/** @deprecated Prefer `requireSyncedUser` or `getCurrentUserOrThrow`. */
export { requireCurrentUser } from "./current-user";

// --- Sync ---
export {
  syncClerkUser,
  syncUser,
  toClerkUserSyncInput,
  type AppUser,
} from "./sync-user";

// --- Authorization gates (Phase 9.3) ---
export { requireAppUser } from "./require-auth";

export {
  assertRole,
  hasAnyRole,
  hasRole,
  requireAdmin,
  requireDoctor,
  requirePatient,
  requireReceptionist,
  requireRole,
} from "./require-role";

export {
  getPermissionsForRole,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  roleHasAllPermissions,
  roleHasAnyPermission,
  roleHasPermission,
  type Permission,
} from "./permissions";

export {
  assertPermission,
  authorize,
  can,
  canAll,
  canAny,
  requirePermission,
  requirePermissions,
  type AuthorizeOptions,
} from "./authorization";

export type {
  AuthSession,
  ClerkUserSyncInput,
  RoleRequirement,
  SyncUserOptions,
} from "./types";
