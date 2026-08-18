"use server";

import { getEnv } from "@/config/env";
import { isAdmin } from "@/lib/auth/is-admin";

/**
 * Soft admin check for public navbar chrome.
 * Safe to call from the client after Clerk hydrates — uses the live session
 * instead of a statically baked `isAdmin={false}`.
 */
export async function resolveNavbarIsAdmin(): Promise<boolean> {
  if (!getEnv().hasClerkKeys) {
    return false;
  }

  try {
    return await isAdmin({ touchLastLogin: false });
  } catch {
    return false;
  }
}
