import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { PatientsWorkspace } from "@/features/patients/components/patients-workspace";
import { listPatients } from "@/features/patients/services/list-patients";
import { patientListQuerySchema } from "@/validators/patient";

export const metadata: Metadata = {
  title: "Patients",
};

type PatientsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    limit?: string;
  }>;
};

/**
 * Admin patient list — charts are created from appointment bookings.
 */
export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const params = await searchParams;

  const parsed = patientListQuerySchema.safeParse({
    page: params.page,
    limit: params.limit,
    search: params.search,
    status: params.status,
  });

  const data = await listPatients(
    parsed.success
      ? parsed.data
      : patientListQuerySchema.parse({ status: "all" }),
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Patients"
        description="View patient charts created from appointment bookings. Contact details and active status can be managed here."
      />
      <PatientsWorkspace initialData={data} />
    </div>
  );
}
