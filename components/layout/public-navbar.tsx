import { Navbar } from "@/components/shared/navbar";
import { getEnv } from "@/config/env";
import { isAdmin } from "@/lib/auth";

/**
 * Soft admin check for navbar chrome only.
 * Never throws — missing Clerk / sync failures hide the Dashboard link.
 */
async function resolveNavbarIsAdmin(): Promise<boolean> {
  if (!getEnv().hasClerkKeys) {
    return false;
  }

  try {
    return await isAdmin({ touchLastLogin: false });
  } catch {
    return false;
  }
}

/**
 * Auth-aware public navbar streamed behind Suspense.
 * Fallback is `<Navbar />` (`isAdmin` defaults false).
 */
export async function PublicNavbar() {
  const admin = await resolveNavbarIsAdmin();
  return <Navbar isAdmin={admin} />;
}
