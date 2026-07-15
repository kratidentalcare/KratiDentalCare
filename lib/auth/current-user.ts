/**
 * @deprecated Import from `@/lib/auth` or `./get-current-user` directly.
 * Compatibility shim for Phase 9.2 call sites.
 */
import "server-only";

export {
  getActiveCurrentUser,
  getAppUser,
  getCurrentUser,
  getCurrentUserOrThrow,
  requireSyncedUser as requireCurrentUser,
} from "./get-current-user";
