import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";

/**
 * Instant placeholder while a dashboard module Server Component loads.
 * Nested routes with their own `loading.tsx` (e.g. profile) override this.
 */
export default function DashboardLoading() {
  return <DashboardPageSkeleton />;
}
