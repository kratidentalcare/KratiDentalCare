/**
 * Auth identity types for Clerk sessions and Mongo `users` sync.
 */

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
