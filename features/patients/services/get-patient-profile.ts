import "server-only";

import { PAGINATION } from "@/constants";
import { formatPatientAppointmentLabel } from "@/features/patients/lib/format";
import {
  findAppointmentStatsForPatient,
  findUpcomingAppointmentForPatient,
  listPatientAppointments,
} from "@/features/patients/repositories/appointment-repository";
import { findPatientByIdOrThrow } from "@/features/patients/repositories/patient-repository";
import type {
  PatientAppointmentSummary,
  PatientProfile,
} from "@/features/patients/types";
import { connect } from "@/lib/db";
import type { LeanAppointment } from "@/models/appointment";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { buildPaginationMeta } from "@/types/pagination";

function mapAppointmentSummary(
  appointment: LeanAppointment,
  timezone: string,
): PatientAppointmentSummary {
  const labels = formatPatientAppointmentLabel(appointment.startsAt, timezone);
  return {
    id: String(appointment._id),
    date: labels.date,
    timeLabel: labels.timeLabel,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    status: appointment.status,
    reason: appointment.reason,
    doctorName: appointment.doctorSnapshot.fullName,
    doctorId: String(appointment.doctorId),
  };
}

export async function getPatientProfile(
  id: string,
  historyPage = PAGINATION.DEFAULT_PAGE,
  historyLimit = PAGINATION.DEFAULT_LIMIT,
): Promise<PatientProfile> {
  await connect();

  const settings = await getOrCreateClinicSettings();
  const patient = await findPatientByIdOrThrow(id);

  const [statistics, upcoming, history] = await Promise.all([
    findAppointmentStatsForPatient(id),
    findUpcomingAppointmentForPatient(id),
    listPatientAppointments(id, historyPage, historyLimit),
  ]);

  const historyPagination = buildPaginationMeta(
    historyPage,
    historyLimit,
    history.total,
  );
  const totalPages = Math.max(1, historyPagination.totalPages);

  return {
    id: String(patient._id),
    fullName: patient.fullName,
    phone: patient.phone,
    email: patient.email,
    status: patient.status,
    isActive: patient.isActive,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
    statistics,
    upcomingAppointment: upcoming
      ? mapAppointmentSummary(upcoming, settings.timezone)
      : null,
    appointmentHistory: history.items.map((item) =>
      mapAppointmentSummary(item, settings.timezone),
    ),
    appointmentHistoryPagination: {
      ...historyPagination,
      totalPages,
      hasNextPage: historyPage < totalPages,
      hasPreviousPage: historyPage > 1,
    },
    prescriptionHistoryPlaceholder: true,
    primaryDoctorId: null,
    medicalHistoryReady: false,
    uploadedReportsReady: false,
    allergiesCount: patient.allergies?.length ?? 0,
    hasEmergencyContact: Boolean(
      patient.emergencyContactName && patient.emergencyContactPhone,
    ),
    hasInsuranceDetails: false,
  };
}
