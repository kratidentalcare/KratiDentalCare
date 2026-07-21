import { PageHeader } from "@/components/dashboard";
import { DashboardQuickActionsCard } from "@/features/dashboard/components/dashboard-quick-actions";
import { DashboardStatCards } from "@/features/dashboard/components/dashboard-stat-cards";
import { RecentAppointmentsPanel } from "@/features/dashboard/components/recent-appointments-panel";
import { RecentPatientsPanel } from "@/features/dashboard/components/recent-patients-panel";
import { getDashboardOverview } from "@/features/dashboard/services/get-dashboard-overview";

/**
 * Dashboard overview — live clinic metrics and recent activity.
 */
export default async function DashboardHomePage() {
  const overview = await getDashboardOverview();

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Overview"
        description={`Clinic activity for ${overview.todayCivilDate} (${overview.timezone}).`}
      />

      <DashboardStatCards metrics={overview.metrics} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2">
          <RecentAppointmentsPanel items={overview.recentAppointments} />
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <DashboardQuickActionsCard />
          <RecentPatientsPanel items={overview.recentPatients} />
        </div>
      </div>
    </div>
  );
}
