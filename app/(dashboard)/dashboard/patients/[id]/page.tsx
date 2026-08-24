import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard";
import {
  PATIENT_DOCUMENT_LIST_DEFAULT_LIMIT,
  PATIENT_DOCUMENT_TYPE_VALUES,
} from "@/constants/patient-documents";
import { listPatientDocuments } from "@/features/patient-documents/services/list-patient-documents";
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
    rxPage?: string;
    rxLimit?: string;
    docsPage?: string;
    docsLimit?: string;
    docsType?: string;
    docsQ?: string;
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

  const docsTypeParsed = PATIENT_DOCUMENT_TYPE_VALUES.includes(
    query.docsType as (typeof PATIENT_DOCUMENT_TYPE_VALUES)[number],
  )
    ? (query.docsType as (typeof PATIENT_DOCUMENT_TYPE_VALUES)[number])
    : undefined;

  let profile;
  let documents;
  try {
    [profile, documents] = await Promise.all([
      getPatientProfile(
        idParsed.data,
        query.historyPage
          ? Number(query.historyPage)
          : PAGINATION.DEFAULT_PAGE,
        query.historyLimit
          ? Number(query.historyLimit)
          : PAGINATION.DEFAULT_LIMIT,
        query.rxPage ? Number(query.rxPage) : PAGINATION.DEFAULT_PAGE,
        query.rxLimit ? Number(query.rxLimit) : PAGINATION.DEFAULT_LIMIT,
      ),
      listPatientDocuments({
        patientId: idParsed.data,
        page: query.docsPage
          ? Number(query.docsPage)
          : PAGINATION.DEFAULT_PAGE,
        limit: query.docsLimit
          ? Number(query.docsLimit)
          : PATIENT_DOCUMENT_LIST_DEFAULT_LIMIT,
        type: docsTypeParsed,
        search: query.docsQ?.trim() || undefined,
      }),
    ]);
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
      <PatientProfileView
        profile={{
          ...profile,
          uploadedReportsReady: documents.pagination.total > 0,
        }}
        documents={documents}
        documentsSearch={query.docsQ?.trim() ?? ""}
        documentsType={docsTypeParsed ?? null}
      />
    </div>
  );
}
