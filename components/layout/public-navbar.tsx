import { Navbar } from "@/components/shared/navbar";
import { resolveNavbarIsAdmin } from "@/lib/auth/resolve-navbar-is-admin";

/**
 * Auth-aware public navbar streamed behind Suspense.
 * Fallback is `<Navbar />` (`showDashboard` defaults false).
 */
export async function PublicNavbar() {
  const access = await resolveNavbarIsAdmin();
  return <Navbar showDashboard={access === true} />;
}
