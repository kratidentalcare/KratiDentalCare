import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { AppointmentsWorkspace } from "@/features/appointments/components/appointments-workspace";
import { listAppointments } from "@/features/appointments/services/list-appointments";
import { PAGINATION } from "@/constants";
import type { AppointmentListQuery } from "@/validators/appointment-booking";

export const metadata: Metadata = {
  title: "Appointments",
};

type AppointmentsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    date?: string;
  }>;
};

/**
 * Admin appointment list and lifecycle management.
 */
export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  const params = await searchParams;

  const data = await listAppointments({
    page: params.page ? Number(params.page) : PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    search: params.search,
    status: params.status as AppointmentListQuery["status"],
    date: params.date,
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Appointments"
        description="Review bookings, approve requests, and manage the appointment lifecycle."
      />
      <AppointmentsWorkspace initialData={data} />
    </div>
  );
}
