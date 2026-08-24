import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { MedicinesWorkspace } from "@/features/medicines/components/medicines-workspace";
import { listMedicines } from "@/features/medicines/services/list-medicines";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import { medicineListQuerySchema } from "@/validators/medicine";

export const metadata: Metadata = {
  title: "Medicines",
};

type MedicinesPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    limit?: string;
  }>;
};

/**
 * Admin Medicine Library — catalog defaults for E-Prescriptions.
 */
export default async function MedicinesPage({
  searchParams,
}: MedicinesPageProps) {
  await requirePermission(PERMISSIONS.MEDICINES_MANAGE);
  const params = await searchParams;

  const parsed = medicineListQuerySchema.safeParse({
    page: params.page,
    limit: params.limit,
    search: params.search,
    status: params.status,
  });

  const data = await listMedicines(
    parsed.success
      ? parsed.data
      : medicineListQuerySchema.parse({ status: "all" }),
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Medicines"
        description="Maintain commonly used medicines and default prescription instructions. Doctors can search this library while writing E-Prescriptions."
      />
      <MedicinesWorkspace initialData={data} />
    </div>
  );
}
