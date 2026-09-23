"use server";

import { logger } from "@/lib/logger";

import { getCurrentUser } from "./get-current-user";

/**
 * Writes the current Clerk session into Mongo.
 *
 * Modal sign-up/sign-in updates the client session without re-running server
 * layouts, so `getCurrentUser` never runs and the admin user list stays empty.
 * Google OAuth does a full navigation, which is why those users appear.
 */
export async function syncCurrentUserSession(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user != null;
  } catch (error) {
    logger.error("Failed to sync user after client sign-in", error);
    return false;
  }
}
