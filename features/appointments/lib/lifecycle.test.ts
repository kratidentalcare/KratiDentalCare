import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { evaluateBookingPolicy } from "@/features/appointments/lib/booking-policy";
import {
  canRescheduleAppointment,
  canTransitionAppointmentStatus,
  isAppointmentBlockingNewBooking,
} from "@/features/appointments/lib/lifecycle";
import {
  buildActivePatientHold,
  buildOccupancyKey,
} from "@/features/appointments/lib/occupancy";

describe("appointment lifecycle", () => {
  it("allows pending to confirmed and cancelled", () => {
    assert.equal(
      canTransitionAppointmentStatus(
        APPOINTMENT_STATUSES.PENDING,
        APPOINTMENT_STATUSES.CONFIRMED,
      ),
      true,
    );
    assert.equal(
      canTransitionAppointmentStatus(
        APPOINTMENT_STATUSES.PENDING,
        APPOINTMENT_STATUSES.CANCELLED,
      ),
      true,
    );
  });

  it("blocks completed to pending", () => {
    assert.equal(
      canTransitionAppointmentStatus(
        APPOINTMENT_STATUSES.COMPLETED,
        APPOINTMENT_STATUSES.PENDING,
      ),
      false,
    );
  });

  it("permits reschedule only for future pending/confirmed", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    const past = new Date(Date.now() - 60 * 60 * 1000);

    assert.equal(
      canRescheduleAppointment(APPOINTMENT_STATUSES.PENDING, future),
      true,
    );
    assert.equal(
      canRescheduleAppointment(APPOINTMENT_STATUSES.CONFIRMED, future),
      true,
    );
    assert.equal(
      canRescheduleAppointment(APPOINTMENT_STATUSES.PENDING, past),
      false,
    );
    assert.equal(
      canRescheduleAppointment(APPOINTMENT_STATUSES.CANCELLED, future),
      false,
    );
  });
});

describe("booking policy", () => {
  const rules = {
    minLeadTimeHours: 2,
    maxAdvanceDays: 30,
    cancellationCutoffHours: 2,
    allowSameDayBooking: false,
  };

  it("rejects same-day booking when disabled", () => {
    const now = new Date("2026-07-17T10:00:00.000Z");
    const result = evaluateBookingPolicy({
      selectedDate: "2026-07-17",
      slotStartAt: new Date("2026-07-17T14:00:00.000Z"),
      timezone: "Asia/Kolkata",
      rules,
      now,
    });

    assert.equal(result.allowed, false);
    if (!result.allowed) {
      assert.equal(result.reason, "same-day-disabled");
    }
  });

  it("rejects slots inside lead time", () => {
    const now = new Date("2026-07-17T10:00:00.000Z");
    const result = evaluateBookingPolicy({
      selectedDate: "2026-07-18",
      slotStartAt: new Date("2026-07-17T11:00:00.000Z"),
      timezone: "UTC",
      rules,
      now,
    });

    assert.equal(result.allowed, false);
    if (!result.allowed) {
      assert.equal(result.reason, "lead-time-not-met");
    }
  });
});

describe("occupancy key", () => {
  it("builds stable minute-level keys", () => {
    const startsAt = new Date("2026-07-18T09:30:00.000Z");
    const key = buildOccupancyKey("507f1f77bcf86cd799439011", startsAt);
    assert.match(key, /^507f1f77bcf86cd799439011:\d+$/);
  });

  it("builds a patient hold from the patient id", () => {
    assert.equal(
      buildActivePatientHold("507f1f77bcf86cd799439011"),
      "507f1f77bcf86cd799439011",
    );
  });
});

describe("booking hold statuses", () => {
  it("blocks pending, confirmed, and checked-in visits", () => {
    assert.equal(
      isAppointmentBlockingNewBooking({
        status: APPOINTMENT_STATUSES.PENDING,
      }),
      true,
    );
    assert.equal(
      isAppointmentBlockingNewBooking({
        status: APPOINTMENT_STATUSES.CONFIRMED,
      }),
      true,
    );
    assert.equal(
      isAppointmentBlockingNewBooking({
        status: APPOINTMENT_STATUSES.CHECKED_IN,
      }),
      true,
    );
  });

  it("allows cancelled, completed, no-show, and archived visits", () => {
    assert.equal(
      isAppointmentBlockingNewBooking({
        status: APPOINTMENT_STATUSES.CANCELLED,
      }),
      false,
    );
    assert.equal(
      isAppointmentBlockingNewBooking({
        status: APPOINTMENT_STATUSES.COMPLETED,
      }),
      false,
    );
    assert.equal(
      isAppointmentBlockingNewBooking({
        status: APPOINTMENT_STATUSES.NO_SHOW,
      }),
      false,
    );
    assert.equal(
      isAppointmentBlockingNewBooking({
        status: APPOINTMENT_STATUSES.ARCHIVED,
      }),
      false,
    );
  });

  it("ignores soft-deleted rows even if status is pending", () => {
    assert.equal(
      isAppointmentBlockingNewBooking({
        status: APPOINTMENT_STATUSES.PENDING,
        deletedAt: new Date(),
      }),
      false,
    );
  });
});
