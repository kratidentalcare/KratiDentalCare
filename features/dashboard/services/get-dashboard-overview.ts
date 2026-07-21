import "server-only";

import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { formatSlotLabel } from "@/features/appointments/lib/format";
import type { AppointmentListItem } from "@/features/appointments/types";
import type {
  DashboardOverview,
  DashboardRecentPatient,
} from "@/features/dashboard/types";
import {
  addOneCivilDay,
  utcToCivilDate,
  zonedDateTimeToUtc,
} from "@/features/scheduling/lib/timezone";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { connect } from "@/lib/db";
import { Appointment, type LeanAppointment } from "@/models/appointment";
import { Patient, type LeanPatient } from "@/models/patient";
import { Prescription } from "@/models/prescription";

const RECENT_APPOINTMENTS_LIMIT = 8;
const RECENT_PATIENTS_LIMIT = 6;

const NON_TERMINAL_STATUSES = [
  APPOINTMENT_STATUSES.PENDING,
  APPOINTMENT_STATUSES.CONFIRMED,
  APPOINTMENT_STATUSES.CHECKED_IN,
] as const;

function mapAppointmentListItem(
  appointment: LeanAppointment,
  timezone: string,
): AppointmentListItem {
  return {
    id: String(appointment._id),
    patientName: appointment.patientSnapshot.fullName,
    phone: appointment.patientSnapshot.phone,
    email: appointment.patientSnapshot.email,
    date: utcToCivilDate(appointment.startsAt, timezone),
    timeLabel: formatSlotLabel(appointment.startsAt, timezone),
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    status: appointment.status,
    reason: appointment.reason,
    doctorName: appointment.doctorSnapshot.fullName,
    createdAt: appointment.createdAt.toISOString(),
  };
}

function mapRecentPatient(patient: LeanPatient): DashboardRecentPatient {
  return {
    id: String(patient._id),
    fullName: patient.fullName,
    phone: patient.phone,
    email: patient.email,
    status: patient.status,
    createdAt: patient.createdAt.toISOString(),
  };
}

type AppointmentFacetResult = {
  today: Array<{ count: number }>;
  upcoming: Array<{ count: number }>;
  completed: Array<{ count: number }>;
  cancelled: Array<{ count: number }>;
  pending: Array<{ count: number }>;
  recent: LeanAppointment[];
};

function facetCount(rows: Array<{ count: number }> | undefined): number {
  return rows?.[0]?.count ?? 0;
}

/**
 * Loads live clinic overview metrics and recent lists in one parallel batch.
 * Avoids N+1 by using a single appointment `$facet` plus patient/prescription counts.
 */
export async function getDashboardOverview(
  now: Date = new Date(),
): Promise<DashboardOverview> {
  await connect();

  const settings = await getOrCreateClinicSettings();
  const timezone = settings.timezone;
  const todayCivilDate = utcToCivilDate(now, timezone);
  const dayStart = zonedDateTimeToUtc(todayCivilDate, "00:00", timezone);
  const dayEnd = zonedDateTimeToUtc(
    addOneCivilDay(todayCivilDate),
    "00:00",
    timezone,
  );

  const baseFilter = { deletedAt: null };

  const [appointmentFacet, totalPatients, todayPrescriptions, recentPatients] =
    await Promise.all([
      Appointment.aggregate<AppointmentFacetResult>([
        { $match: baseFilter },
        {
          $facet: {
            today: [
              {
                $match: {
                  startsAt: { $gte: dayStart, $lt: dayEnd },
                },
              },
              { $count: "count" },
            ],
            upcoming: [
              {
                $match: {
                  startsAt: { $gte: now },
                  status: { $in: [...NON_TERMINAL_STATUSES] },
                },
              },
              { $count: "count" },
            ],
            completed: [
              {
                $match: { status: APPOINTMENT_STATUSES.COMPLETED },
              },
              { $count: "count" },
            ],
            cancelled: [
              {
                $match: { status: APPOINTMENT_STATUSES.CANCELLED },
              },
              { $count: "count" },
            ],
            pending: [
              {
                $match: { status: APPOINTMENT_STATUSES.PENDING },
              },
              { $count: "count" },
            ],
            recent: [
              { $sort: { startsAt: -1 } },
              { $limit: RECENT_APPOINTMENTS_LIMIT },
            ],
          },
        },
      ]).then((rows) => rows[0]!),
      Patient.countDocuments(baseFilter),
      Prescription.countDocuments({
        deletedAt: null,
        $or: [
          { issuedAt: { $gte: dayStart, $lt: dayEnd } },
          {
            issuedAt: null,
            createdAt: { $gte: dayStart, $lt: dayEnd },
          },
        ],
      }),
      Patient.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(RECENT_PATIENTS_LIMIT)
        .lean<LeanPatient[]>(),
    ]);

  return {
    metrics: {
      todayAppointments: facetCount(appointmentFacet.today),
      upcomingAppointments: facetCount(appointmentFacet.upcoming),
      completedAppointments: facetCount(appointmentFacet.completed),
      cancelledAppointments: facetCount(appointmentFacet.cancelled),
      pendingAppointments: facetCount(appointmentFacet.pending),
      totalPatients,
      todayPrescriptions,
    },
    recentAppointments: appointmentFacet.recent.map((item) =>
      mapAppointmentListItem(item, timezone),
    ),
    recentPatients: recentPatients.map(mapRecentPatient),
    timezone,
    todayCivilDate,
  };
}
