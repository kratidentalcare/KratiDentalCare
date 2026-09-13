import { Navbar } from "@/components/shared/navbar";
import { getActiveCurrentUser } from "@/lib/auth/get-current-user";
import { resolveNavbarIsAdmin } from "@/lib/auth/resolve-navbar-is-admin";

/**
 * Auth-aware public navbar streamed behind Suspense.
 * Fallback is `<Navbar />` (`showDashboard` defaults false).
 */
export async function PublicNavbar() {
  try {
    await getActiveCurrentUser({ touchLastLogin: false });
  } catch {
    // Navbar must stay up even if Clerk profile sync fails.
  }

  const access = await resolveNavbarIsAdmin();
  return <Navbar showDashboard={access === true} />;
}
