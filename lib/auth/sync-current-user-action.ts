"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { logger } from "@/lib/logger";

import { getCurrentUser } from "./get-current-user";

/**
 * Writes the current Clerk session into Mongo.
 * Covers modal sign-in and full-page loads that mount already signed in.
 */
export async function syncCurrentUserSession(): Promise<boolean> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return false;
    }

    revalidatePath(ROUTES.DASHBOARD.USERS);
    return true;
  } catch (error) {
    logger.error("Failed to sync user after client sign-in", error);
    return false;
  }
}
