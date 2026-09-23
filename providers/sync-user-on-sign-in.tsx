"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { syncCurrentUserSession } from "@/lib/auth/sync-current-user-action";

const RETRY_DELAY_MS = 500;

/**
 * Persists a user created by the sign-in/sign-up modal.
 * Skips the initial load when the server layout already synced the session.
 */
export function SyncUserOnSignIn() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const sawSignedOut = useRef(false);
  const syncedKey = useRef<string | null>(null);

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "";

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !userId) {
      sawSignedOut.current = true;
      return;
    }

    if (!sawSignedOut.current) {
      return;
    }

    const attemptKey = `${userId}:${email}`;
    if (syncedKey.current === attemptKey) {
      return;
    }

    let cancelled = false;

    void (async () => {
      let synced = await syncCurrentUserSession();

      if (!synced && !cancelled) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, RETRY_DELAY_MS);
        });

        if (!cancelled) {
          synced = await syncCurrentUserSession();
        }
      }

      if (!synced || cancelled) {
        return;
      }

      syncedKey.current = attemptKey;
      router.refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [email, isLoaded, isSignedIn, router, userId]);

  return null;
}
