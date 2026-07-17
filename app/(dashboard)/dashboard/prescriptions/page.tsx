import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { PrescriptionForm } from "@/components/dashboard/prescriptions/prescription-form";
import { PrescriptionsWorkspace } from "@/components/dashboard/prescriptions/prescriptions-workspace";
import { PAGINATION } from "@/constants";
import { listPrescriptionsService } from "@/features/prescriptions/services/list-prescriptions";
import { resolvePrescriptionWorkspace } from "@/features/prescriptions/services/save-prescription";
import { isAppError } from "@/lib/errors";
import { objectIdSchema } from "@/validators/common";

export const metadata: Metadata = {
  title: "E-Prescriptions",
};

type PrescriptionsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    appointmentId?: string;
  }>;
};

/**
 * Prescription list, or create/edit workspace when `appointmentId` is present.
 */
export default async function PrescriptionsPage({
  searchParams,
}: PrescriptionsPageProps) {
  const params = await searchParams;

  if (params.appointmentId) {
    const parsed = objectIdSchema.safeParse(params.appointmentId);
    if (!parsed.success) {
      return (
        <div className="flex flex-col gap-6 sm:gap-8">
          <PageHeader
            title="E-Prescriptions"
            description="Invalid appointment reference."
          />
          <p className="text-sm text-muted-foreground">
            The appointment id is not valid.
          </p>
        </div>
      );
    }

    try {
      const context = await resolvePrescriptionWorkspace(parsed.data);
      return (
        <div className="flex flex-col gap-6 sm:gap-8">
          <PageHeader
            title="E-Prescriptions"
            description="Create, preview, and print clinic prescriptions on the official letterhead."
          />
          <PrescriptionForm context={context} />
        </div>
      );
    } catch (error) {
      const message = isAppError(error)
        ? error.message
        : "Unable to open prescription workspace.";
      return (
        <div className="flex flex-col gap-6 sm:gap-8">
          <PageHeader
            title="E-Prescriptions"
            description="Create, preview, and print clinic prescriptions."
          />
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-100">
            {message}
          </p>
        </div>
      );
    }
  }

  const data = await listPrescriptionsService({
    page: params.page ? Number(params.page) : PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    search: params.search,
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="E-Prescriptions"
        description="Browse issued prescriptions. Create new ones from completed appointments."
      />
      <PrescriptionsWorkspace
        initialData={data}
        search={params.search ?? ""}
      />
    </div>
  );
}
