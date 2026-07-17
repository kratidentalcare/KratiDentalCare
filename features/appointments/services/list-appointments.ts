import "server-only";

import { Types } from "mongoose";

import { PAGINATION } from "@/constants";
import { formatSlotLabel } from "@/features/appointments/lib/format";
import type {
  AppointmentDetail,
  AppointmentListItem,
  AppointmentListResult,
} from "@/features/appointments/types";
import { connect } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { Appointment, type LeanAppointment } from "@/models/appointment";
import { AppointmentEvent } from "@/models/appointment-event";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { utcToCivilDate } from "@/features/scheduling/lib/timezone";
import { zonedDateTimeToUtc } from "@/features/scheduling/lib/timezone";
import type { AppointmentListQuery } from "@/validators/appointment-booking";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapListItem(
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

export async function listAppointments(
  query: AppointmentListQuery,
): Promise<AppointmentListResult> {
  await connect();

  const settings = await getOrCreateClinicSettings();
  const filter: Record<string, unknown> = { deletedAt: null };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.date) {
    const dayStart = zonedDateTimeToUtc(query.date, "00:00", settings.timezone);
    const nextDay = new Date(dayStart);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    filter.startsAt = { $gte: dayStart, $lt: nextDay };
  }

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [
      { "patientSnapshot.fullName": pattern },
      { "patientSnapshot.phone": pattern },
      { "patientSnapshot.email": pattern },
      { reason: pattern },
    ];
  }

  const page = query.page ?? PAGINATION.DEFAULT_PAGE;
  const limit = query.limit ?? PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .sort({ startsAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanAppointment[]>(),
    Appointment.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: items.map((item) => mapListItem(item, settings.timezone)),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getAppointmentDetail(
  id: string,
): Promise<AppointmentDetail> {
  await connect();

  const settings = await getOrCreateClinicSettings();

  const appointment = await Appointment.findOne({
    _id: new Types.ObjectId(id),
    deletedAt: null,
  }).lean<LeanAppointment>();

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  const events = await AppointmentEvent.find({
    appointmentId: appointment._id,
  })
    .sort({ createdAt: -1 })
    .lean<Array<{
      _id: Types.ObjectId;
      eventType: string;
      actorUserId: Types.ObjectId | null;
      payload: Record<string, unknown> | null;
      createdAt: Date;
    }>>();

  const base = mapListItem(appointment, settings.timezone);

  return {
    ...base,
    notes: appointment.notes,
    cancellationReason: appointment.cancellationReason,
    cancelledAt: appointment.cancelledAt?.toISOString() ?? null,
    bookingSource: appointment.bookingSource,
    checkedInAt: appointment.checkedInAt?.toISOString() ?? null,
    completedAt: appointment.completedAt?.toISOString() ?? null,
    rescheduledFromStartsAt:
      appointment.rescheduledFromStartsAt?.toISOString() ?? null,
    rescheduledFromEndsAt:
      appointment.rescheduledFromEndsAt?.toISOString() ?? null,
    events: events.map((event) => ({
      id: String(event._id),
      eventType: event.eventType,
      actorUserId: event.actorUserId ? String(event.actorUserId) : null,
      payload: event.payload,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
