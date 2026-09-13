import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ACTIVE_BOOKING_CONFLICT_MESSAGE,
} from "@/constants/appointments";
import { ERROR_CODES } from "@/constants/error-codes";
import { GENDERS } from "@/constants/patient";
import { publicBookingSchema, staffBookingSchema } from "@/validators/appointment-booking";

const validPublicBooking = {
  fullName: "Rahul Sharma",
  phone: "9876543210",
  email: "Rahul@example.com",
  ageYears: 32,
  gender: GENDERS.MALE,
  reason: "Tooth pain",
  date: "2026-09-20",
  startAt: "2026-09-20T04:30:00.000Z",
  endAt: "2026-09-20T05:00:00.000Z",
};

describe("public booking duplicate-conflict contract", () => {
  it("strips a public override flag instead of honoring it", () => {
    const parsed = publicBookingSchema.safeParse({
      ...validPublicBooking,
      allowMultipleActiveAppointments: true,
      confirmMultipleActiveAppointments: true,
    });
    assert.equal(parsed.success, true);
    if (!parsed.success) {
      return;
    }
    assert.equal(
      "allowMultipleActiveAppointments" in parsed.data,
      false,
    );
    assert.equal(
      "confirmMultipleActiveAppointments" in parsed.data,
      false,
    );
  });

  it("does not leak appointment details in the public conflict message", () => {
    const lowered = ACTIVE_BOOKING_CONFLICT_MESSAGE.toLowerCase();
    assert.equal(lowered.includes("rahul"), false);
    assert.equal(lowered.includes("10:00"), false);
    assert.equal(lowered.includes("doctor"), false);
    assert.equal(lowered.includes("appointment id"), false);
    assert.equal(ERROR_CODES.ACTIVE_BOOKING_EXISTS, "ACTIVE_BOOKING_EXISTS");
  });

  it("defaults staff confirmation to false", () => {
    const parsed = staffBookingSchema.safeParse({
      patientId: "507f1f77bcf86cd799439011",
      doctorId: "507f1f77bcf86cd799439012",
      date: "2026-09-20",
      startAt: "2026-09-20T04:30:00.000Z",
      endAt: "2026-09-20T05:00:00.000Z",
      reason: "Walk-in consult",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.confirmMultipleActiveAppointments, false);
    }
  });
});
