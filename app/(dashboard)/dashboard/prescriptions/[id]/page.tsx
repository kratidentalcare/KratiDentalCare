import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard";
import { PrescriptionForm } from "@/components/dashboard/prescriptions/prescription-form";
import { getPrescriptionDetail } from "@/features/prescriptions/services/save-prescription";
import { isAppError } from "@/lib/errors";
import { objectIdSchema } from "@/validators/common";

export const metadata: Metadata = {
  title: "Prescription",
};

type PrescriptionDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Open an existing prescription by id (falls back when no appointment link).
 */
export default async function PrescriptionDetailPage({
  params,
}: PrescriptionDetailPageProps) {
  const { id } = await params;
  const parsed = objectIdSchema.safeParse(id);
  if (!parsed.success) {
    notFound();
  }

  let detail;
  try {
    detail = await getPrescriptionDetail(parsed.data);
  } catch (error) {
    if (isAppError(error) && error.status === 404) {
      notFound();
    }
    throw error;
  }

  if (!detail.appointmentId) {
    return (
      <div className="flex flex-col gap-6 sm:gap-8">
        <PageHeader
          title="Prescription"
          description={`Rx ${detail.prescriptionNumber}`}
        />
        <p className="text-sm text-muted-foreground">
          This prescription is not linked to an appointment and cannot be edited
          in the appointment workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Prescription"
        description={`Rx ${detail.prescriptionNumber}`}
      />
      <PrescriptionForm
        context={{
          mode: "edit",
          prescription: detail,
        }}
      />
    </div>
  );
}
