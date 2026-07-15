/**
 * Auth helpers — Clerk session, Mongo user sync, and authorization.
 *
 * Typical Server Action order:
 * 1. `requireAppUser()` / `requireRole(...)` / `authorize(...)`
 * 2. Zod validate
 * 3. service
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

export { assertActiveAppUser, requireAppUser } from "./require-auth";

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
