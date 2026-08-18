import { Navbar } from "@/components/shared/navbar";
import { resolveNavbarIsAdmin } from "@/lib/auth/resolve-navbar-is-admin";

/**
 * Auth-aware public navbar streamed behind Suspense.
 * Fallback is `<Navbar />` (`isAdmin` defaults false).
 */
export async function PublicNavbar() {
  const admin = await resolveNavbarIsAdmin();
  return <Navbar isAdmin={admin} />;
}
