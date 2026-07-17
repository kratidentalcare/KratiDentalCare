import "server-only";

import {
  formatDisplayDate,
} from "@/features/prescriptions/lib/format";
import { listPrescriptionsForPatient } from "@/features/prescriptions/repositories/prescription-repository";
import type { PatientPrescriptionSummary } from "@/features/prescriptions/types";
import { connect } from "@/lib/db";
import { buildPaginationMeta } from "@/types/pagination";
import type { PaginationMeta } from "@/types/api";

export async function listPatientPrescriptionHistory(
  patientId: string,
  page = 1,
  limit = 10,
): Promise<{
  items: PatientPrescriptionSummary[];
  pagination: PaginationMeta & {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}> {
  await connect();

  const { items, total } = await listPrescriptionsForPatient(
    patientId,
    page,
    limit,
  );

  const pagination = buildPaginationMeta(page, limit, total);
  const totalPages = Math.max(1, pagination.totalPages);

  return {
    items: items.map((rx) => ({
      id: String(rx._id),
      prescriptionNumber: rx.prescriptionNumber,
      status: rx.status,
      diagnosis: rx.diagnosis,
      doctorName: rx.doctorSnapshot.fullName,
      issuedAt: rx.issuedAt?.toISOString() ?? null,
      issuedDateLabel: formatDisplayDate(rx.issuedAt),
      appointmentId: rx.appointmentId ? String(rx.appointmentId) : null,
      medicationCount: rx.medications.length,
    })),
    pagination: {
      ...pagination,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
