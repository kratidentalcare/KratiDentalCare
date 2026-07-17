import type { AvailabilityResult } from "@/features/scheduling/types";
import type { AppointmentStatus } from "@/constants/statuses";
import type { BookingSource } from "@/constants/appointments";
import type { PaginationMeta } from "@/types/api";

export type BookingAvailabilityResult = AvailabilityResult & {
  doctorId: string;
  doctorName: string;
};

export type PublicBookingConfirmation = {
  reference: string;
  status: AppointmentStatus;
  date: string;
  startAt: string;
  endAt: string;
  label: string;
  timezone: string;
  patientName: string;
};

export type AppointmentListItem = {
  id: string;
  patientName: string;
  phone: string;
  email: string;
  date: string;
  timeLabel: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  reason: string | null;
  doctorName: string;
  createdAt: string;
};

export type AppointmentDetail = AppointmentListItem & {
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  bookingSource: BookingSource;
  checkedInAt: string | null;
  completedAt: string | null;
  rescheduledFromStartsAt: string | null;
  rescheduledFromEndsAt: string | null;
  events: AppointmentEventItem[];
};

export type AppointmentEventItem = {
  id: string;
  eventType: string;
  actorUserId: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

export type AppointmentListResult = {
  items: AppointmentListItem[];
  pagination: PaginationMeta;
};
