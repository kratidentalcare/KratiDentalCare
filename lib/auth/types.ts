/**
 * Auth identity types for Clerk sessions, Mongo sync, and authorization.
 */

import type { UserRole } from "@/constants/roles";

export type AuthSession = {
  userId: string;
  sessionId: string | null;
};

/**
 * Clerk-owned profile fields used for Mongo synchronization.
 * Application-managed fields (`role`, `isActive`, …) are intentionally absent.
 */
export type ClerkUserSyncInput = {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  profileImage: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
};

export type SyncUserOptions = {
  /**
   * When true (default), bump `lastLoginAt` after a successful sync.
   * Webhook-only profile updates may pass `false` later.
   */
  touchLastLogin?: boolean;
};

/** One or more roles accepted by `requireRole` / `hasAnyRole`. */
export type RoleRequirement = UserRole | readonly UserRole[];

