import type { Types } from "mongoose";

import { BOOKING_SOURCES } from "@/constants/appointments";
import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { buildOccupancyKey } from "@/features/appointments/lib/occupancy";
import { Appointment } from "@/models/appointment";

import { SEED_APPOINTMENT_REASONS, SEED_COUNTS, SEED_IDS } from "../config";
import type { SeedContext } from "../lib/context";
import { padSeedIndex, seedFaker } from "../lib/indian-data";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

const DURATION_MS = 30 * 60 * 1000;

type PlannedStatus =
  | typeof APPOINTMENT_STATUSES.PENDING
  | typeof APPOINTMENT_STATUSES.CONFIRMED
  | typeof APPOINTMENT_STATUSES.COMPLETED
  | typeof APPOINTMENT_STATUSES.CANCELLED;

function buildStatusPlan(): PlannedStatus[] {
  const plan: PlannedStatus[] = [
    ...Array.from(
      { length: SEED_COUNTS.completedAppointments },
      () => APPOINTMENT_STATUSES.COMPLETED,
    ),
    ...Array.from(
      { length: SEED_COUNTS.pendingAppointments },
      () => APPOINTMENT_STATUSES.PENDING,
    ),
    ...Array.from(
      { length: SEED_COUNTS.confirmedAppointments },
      () => APPOINTMENT_STATUSES.CONFIRMED,
    ),
    ...Array.from(
      { length: SEED_COUNTS.cancelledAppointments },
      () => APPOINTMENT_STATUSES.CANCELLED,
    ),
  ];

  if (plan.length !== SEED_COUNTS.appointments) {
    throw new Error(
      `Appointment status plan length ${plan.length} !== ${SEED_COUNTS.appointments}`,
    );
  }

  return plan;
}

/**
 * Spread appointments across unique doctor-minutes to satisfy occupancyKey uniqueness.
 * Starts from a fixed UTC base so re-runs keep stable-ish times.
 */
function appointmentStartsAt(index: number): Date {
  const base = Date.UTC(2026, 0, 5, 4, 30, 0); // ~10:00 IST on a Monday
  // 45-minute steps keep 30-min visits non-overlapping on occupancy minute keys
  return new Date(base + index * 45 * 60 * 1000);
}

export async function seedAppointments(ctx: SeedContext): Promise<void> {
  if (ctx.patients.length === 0) {
    throw new Error("Cannot seed appointments without patients");
  }

  const statuses = buildStatusPlan();
  const completedIds: Types.ObjectId[] = [];

  for (let i = 0; i < SEED_COUNTS.appointments; i += 1) {
    const status = statuses[i]!;
    const patient = ctx.patients[i % ctx.patients.length]!;
    const startsAt = appointmentStartsAt(i);
    const endsAt = new Date(startsAt.getTime() + DURATION_MS);
    const bookingReference = `${SEED_IDS.appointmentBookingPrefix}${padSeedIndex(i + 1)}`;
    const reason = seedFaker.helpers.arrayElement([...SEED_APPOINTMENT_REASONS]);
    const isCancelled = status === APPOINTMENT_STATUSES.CANCELLED;
    const isCompleted = status === APPOINTMENT_STATUSES.COMPLETED;

    const checkedInAt = isCompleted
      ? new Date(startsAt.getTime() - 10 * 60 * 1000)
      : null;
    const completedAt = isCompleted
      ? new Date(endsAt.getTime() + 5 * 60 * 1000)
      : null;

    const { doc } = await upsertOne(
      Appointment,
      { bookingReference },
      {
        patientId: patient._id,
        doctorId: ctx.doctor._id,
        slotId: null,
        status,
        reason,
        notes: "Demo seed appointment",
        cancellationReason: isCancelled ? "Patient requested cancellation" : null,
        cancelledAt: isCancelled ? new Date(startsAt.getTime() - 24 * 60 * 60 * 1000) : null,
        cancelledByUserId: isCancelled ? ctx.admin._id : null,
        bookedByUserId: ctx.admin._id,
        bookingSource: BOOKING_SOURCES.STAFF,
        bookingReference,
        occupancyKey: isCancelled
          ? null
          : buildOccupancyKey(ctx.doctor._id, startsAt),
        rescheduledFromStartsAt: null,
        rescheduledFromEndsAt: null,
        startsAt,
        endsAt,
        checkedInAt,
        completedAt,
        patientSnapshot: {
          fullName: patient.fullName,
          phone: patient.phone,
          email: patient.email ?? "",
        },
        doctorSnapshot: {
          fullName: ctx.doctor.fullName,
          specialties: [...ctx.doctor.specialties],
        },
      },
    );

    if (isCompleted) {
      completedIds.push(doc._id as Types.ObjectId);
    }
  }

  ctx.completedAppointmentIds = completedIds;
  logOk(`Appointments Seeded (${SEED_COUNTS.appointments})`);
}
