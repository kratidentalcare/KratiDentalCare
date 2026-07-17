import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard";
import { PatientProfileView } from "@/features/patients/components/patient-profile-view";
import { getPatientProfile } from "@/features/patients/services/get-patient-profile";
import { PAGINATION } from "@/constants";
import { isAppError } from "@/lib/errors";
import { objectIdSchema } from "@/validators/common";

export const metadata: Metadata = {
  title: "Patient profile",
};

type PatientProfilePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    historyPage?: string;
    historyLimit?: string;
  }>;
};

/**
 * Patient profile with appointment history and basic administration.
 */
export default async function PatientProfilePage({
  params,
  searchParams,
}: PatientProfilePageProps) {
  const { id } = await params;
  const query = await searchParams;

  const idParsed = objectIdSchema.safeParse(id);
  if (!idParsed.success) {
    notFound();
  }

  let profile;
  try {
    profile = await getPatientProfile(
      idParsed.data,
      query.historyPage
        ? Number(query.historyPage)
        : PAGINATION.DEFAULT_PAGE,
      query.historyLimit
        ? Number(query.historyLimit)
        : PAGINATION.DEFAULT_LIMIT,
    );
  } catch (error) {
    if (isAppError(error) && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Patient profile"
        description="Current contact information, visit history, and chart status."
      />
      <PatientProfileView profile={profile} />
    </div>
  );
}
