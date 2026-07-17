import "server-only";

import { Types } from "mongoose";

import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { Appointment, type LeanAppointment } from "@/models/appointment";

const NON_TERMINAL_STATUSES = [
  APPOINTMENT_STATUSES.PENDING,
  APPOINTMENT_STATUSES.CONFIRMED,
  APPOINTMENT_STATUSES.CHECKED_IN,
] as const;

export type PatientAppointmentAggregate = {
  patientId: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  lastVisitAt: Date | null;
  nextAppointmentAt: Date | null;
};

type AggregateRow = {
  _id: Types.ObjectId;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  lastVisitAt: Date | null;
  nextAppointmentAt: Date | null;
};

/**
 * Aggregates list/profile appointment stats for many patients in one query.
 */
export async function aggregateAppointmentsForPatients(
  patientIds: Types.ObjectId[],
  now: Date = new Date(),
): Promise<Map<string, PatientAppointmentAggregate>> {
  const result = new Map<string, PatientAppointmentAggregate>();

  if (patientIds.length === 0) {
    return result;
  }

  const rows = await Appointment.aggregate<AggregateRow>([
    {
      $match: {
        patientId: { $in: patientIds },
        deletedAt: null,
        status: { $ne: APPOINTMENT_STATUSES.ARCHIVED },
      },
    },
    {
      $group: {
        _id: "$patientId",
        totalAppointments: { $sum: 1 },
        completedAppointments: {
          $sum: {
            $cond: [
              { $eq: ["$status", APPOINTMENT_STATUSES.COMPLETED] },
              1,
              0,
            ],
          },
        },
        cancelledAppointments: {
          $sum: {
            $cond: [
              { $eq: ["$status", APPOINTMENT_STATUSES.CANCELLED] },
              1,
              0,
            ],
          },
        },
        lastVisitAt: {
          $max: {
            $cond: [
              { $eq: ["$status", APPOINTMENT_STATUSES.COMPLETED] },
              "$startsAt",
              null,
            ],
          },
        },
        nextAppointmentAt: {
          $min: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", [...NON_TERMINAL_STATUSES]] },
                  { $gte: ["$startsAt", now] },
                ],
              },
              "$startsAt",
              null,
            ],
          },
        },
      },
    },
  ]);

  for (const row of rows) {
    result.set(String(row._id), {
      patientId: String(row._id),
      totalAppointments: row.totalAppointments,
      completedAppointments: row.completedAppointments,
      cancelledAppointments: row.cancelledAppointments,
      lastVisitAt: row.lastVisitAt,
      nextAppointmentAt: row.nextAppointmentAt,
    });
  }

  return result;
}

export async function listPatientAppointments(
  patientId: string,
  page: number,
  limit: number,
): Promise<{ items: LeanAppointment[]; total: number }> {
  const filter = {
    patientId: new Types.ObjectId(patientId),
    deletedAt: null,
    status: { $ne: APPOINTMENT_STATUSES.ARCHIVED },
  };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .sort({ startsAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanAppointment[]>(),
    Appointment.countDocuments(filter),
  ]);

  return { items, total };
}

export async function findUpcomingAppointmentForPatient(
  patientId: string,
  now: Date = new Date(),
): Promise<LeanAppointment | null> {
  return Appointment.findOne({
    patientId: new Types.ObjectId(patientId),
    deletedAt: null,
    status: { $in: [...NON_TERMINAL_STATUSES] },
    startsAt: { $gte: now },
  })
    .sort({ startsAt: 1 })
    .lean<LeanAppointment>();
}

export async function findAppointmentStatsForPatient(
  patientId: string,
): Promise<{
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}> {
  const map = await aggregateAppointmentsForPatients([
    new Types.ObjectId(patientId),
  ]);
  const stats = map.get(patientId);
  return {
    totalAppointments: stats?.totalAppointments ?? 0,
    completedAppointments: stats?.completedAppointments ?? 0,
    cancelledAppointments: stats?.cancelledAppointments ?? 0,
  };
}
