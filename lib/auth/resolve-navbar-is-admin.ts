"use server";

import { canAccessStaffDashboard } from "@/lib/auth/can-access-staff-dashboard";

/**
 * Soft dashboard-access check for public navbar chrome.
 * Safe to call from the client after Clerk hydrates.
 *
 * `true` / `false` are definitive. `null` means unknown — callers should
 * keep the last known value instead of hiding Dashboard.
 */
export async function resolveNavbarIsAdmin(): Promise<boolean | null> {
  return canAccessStaffDashboard();
}
