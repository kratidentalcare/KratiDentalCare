import "server-only";

import { PAGINATION } from "@/constants";
import { formatPatientAppointmentLabel } from "@/features/patients/lib/format";
import { aggregateAppointmentsForPatients } from "@/features/patients/repositories/appointment-repository";
import {
  buildPatientListFilter,
  listPatientDocuments,
} from "@/features/patients/repositories/patient-repository";
import type { PatientListItem, PatientListResult } from "@/features/patients/types";
import { connect } from "@/lib/db";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { buildPaginationMeta } from "@/types/pagination";
import type { PatientListQuery } from "@/validators/patient";

export async function listPatients(
  query: PatientListQuery,
): Promise<PatientListResult> {
  await connect();

  const settings = await getOrCreateClinicSettings();
  const page = query.page ?? PAGINATION.DEFAULT_PAGE;
  const limit = query.limit ?? PAGINATION.DEFAULT_LIMIT;
  const filter = buildPatientListFilter(query);

  const { items, total } = await listPatientDocuments(filter, page, limit);
  const aggregates = await aggregateAppointmentsForPatients(
    items.map((item) => item._id),
  );

  const mapped: PatientListItem[] = items.map((patient) => {
    const stats = aggregates.get(String(patient._id));
    const lastVisitAt = stats?.lastVisitAt ?? null;
    const nextAppointmentAt = stats?.nextAppointmentAt ?? null;

    return {
      id: String(patient._id),
      fullName: patient.fullName,
      phone: patient.phone,
      email: patient.email,
      status: patient.status,
      totalAppointments: stats?.totalAppointments ?? 0,
      lastVisitAt: lastVisitAt?.toISOString() ?? null,
      lastVisitLabel: lastVisitAt
        ? formatPatientAppointmentLabel(lastVisitAt, settings.timezone).label
        : null,
      nextAppointmentAt: nextAppointmentAt?.toISOString() ?? null,
      nextAppointmentLabel: nextAppointmentAt
        ? formatPatientAppointmentLabel(nextAppointmentAt, settings.timezone)
            .label
        : null,
      createdAt: patient.createdAt.toISOString(),
    };
  });

  const pagination = buildPaginationMeta(page, limit, total);
  const totalPages = Math.max(1, pagination.totalPages);

  return {
    items: mapped,
    pagination: {
      ...pagination,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
