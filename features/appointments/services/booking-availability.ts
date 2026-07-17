import "server-only";

import type { AvailabilityResult } from "@/features/scheduling/types";
import { evaluateBookingPolicy } from "@/features/appointments/lib/booking-policy";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { generateAvailableSlots } from "@/features/scheduling/services/generate-available-slots";
import { DomainError } from "@/lib/errors";
import type { BookingAvailabilityResult } from "@/features/appointments/types";
import { resolveDefaultDoctor } from "@/features/appointments/services/default-doctor";

function applyBookingPolicyToAvailability(
  result: AvailabilityResult,
  date: string,
  timezone: string,
  rules: ReturnType<typeof Object> & {
    minLeadTimeHours: number;
    maxAdvanceDays: number;
    allowSameDayBooking: boolean;
  },
  now?: Date,
): AvailabilityResult {
  const policy = evaluateBookingPolicy({
    selectedDate: date,
    slotStartAt: new Date(),
    timezone,
    rules,
    now,
  });

  if (!policy.allowed && policy.reason !== "lead-time-not-met") {
    return {
      ...result,
      status:
        policy.reason === "past-date"
          ? "past-date"
          : policy.reason === "same-day-disabled"
            ? "clinic-closed"
            : "blocked",
      reason: policy.message,
      slots: [],
      availableCount: 0,
    };
  }

  const filteredSlots = result.slots.filter((slot) => {
    const slotPolicy = evaluateBookingPolicy({
      selectedDate: date,
      slotStartAt: new Date(slot.startAt),
      timezone,
      rules,
      now,
    });
    return slotPolicy.allowed;
  });

  return {
    ...result,
    slots: filteredSlots,
    availableCount: filteredSlots.length,
    status:
      filteredSlots.length > 0
        ? "available"
        : result.status === "available"
          ? "fully-booked"
          : result.status,
    reason:
      filteredSlots.length > 0
        ? null
        : result.reason ?? "No bookable slots remain for this date",
  };
}

/**
 * Public booking availability — resolves default doctor and applies booking policy.
 */
export async function getBookingAvailability(
  date: string,
  options: { excludeAppointmentId?: string; now?: Date } = {},
): Promise<BookingAvailabilityResult> {
  const [settings, doctor] = await Promise.all([
    getOrCreateClinicSettings(),
    resolveDefaultDoctor(),
  ]);

  const engineResult = await generateAvailableSlots(date, {
    doctorId: String(doctor._id),
    durationMinutes: settings.appointmentDurationMinutes,
    includePastTimes: false,
    excludeAppointmentId: options.excludeAppointmentId,
    now: options.now,
  });

  const result = applyBookingPolicyToAvailability(
    engineResult,
    date,
    settings.timezone,
    settings.bookingRules,
    options.now,
  );

  return {
    ...result,
    doctorId: String(doctor._id),
    doctorName: doctor.fullName,
  };
}

/**
 * Validates a proposed slot against live availability before write.
 */
export async function assertSlotAvailableForBooking(input: {
  date: string;
  startAt: Date;
  endAt: Date;
  excludeAppointmentId?: string;
  now?: Date;
}): Promise<{ label: string; timezone: string }> {
  const availability = await getBookingAvailability(input.date, {
    excludeAppointmentId: input.excludeAppointmentId,
    now: input.now,
  });

  if (availability.status !== "available") {
    throw new DomainError(
      "SLOT_UNAVAILABLE",
      availability.reason ?? "Selected time is no longer available",
    );
  }

  const match = availability.slots.find(
    (slot) =>
      new Date(slot.startAt).getTime() === input.startAt.getTime() &&
      new Date(slot.endAt).getTime() === input.endAt.getTime(),
  );

  if (!match) {
    throw new DomainError(
      "SLOT_UNAVAILABLE",
      "Selected time is no longer available",
    );
  }

  return { label: match.label, timezone: availability.timezone };
}
