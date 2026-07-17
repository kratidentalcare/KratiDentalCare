import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AVAILABILITY_STATUSES,
  WEEKDAYS,
} from "@/constants/scheduling";
import { generateSlotsForDate } from "@/features/scheduling/engine/generate-slots";
import type { SchedulingSettingsInput } from "@/features/scheduling/types";

const baseSettings: SchedulingSettingsInput = {
  timezone: "Asia/Kolkata",
  workingDays: [
    WEEKDAYS.MONDAY,
    WEEKDAYS.TUESDAY,
    WEEKDAYS.WEDNESDAY,
    WEEKDAYS.THURSDAY,
    WEEKDAYS.FRIDAY,
    WEEKDAYS.SATURDAY,
  ],
  openingTime: "10:00",
  closingTime: "13:00",
  appointmentDurationMinutes: 30,
  breaks: [],
};

describe("generateSlotsForDate", () => {
  it("generates aligned slots within working hours", () => {
    // 2026-07-20 is a Monday
    const result = generateSlotsForDate({
      date: "2026-07-20",
      settings: baseSettings,
      now: new Date("2026-07-01T00:00:00.000Z"),
    });

    assert.equal(result.status, AVAILABILITY_STATUSES.AVAILABLE);
    assert.deepEqual(
      result.slots.map((slot) => slot.label),
      ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM"],
    );
    assert.equal(result.slots[0]?.startAt, "2026-07-20T04:30:00.000Z");
    assert.equal(result.slots[0]?.endAt, "2026-07-20T05:00:00.000Z");
  });

  it("returns non-working-day for Sunday", () => {
    const result = generateSlotsForDate({
      date: "2026-07-19",
      settings: baseSettings,
      now: new Date("2026-07-01T00:00:00.000Z"),
    });
    assert.equal(result.status, AVAILABILITY_STATUSES.NON_WORKING_DAY);
    assert.equal(result.reason, "Clinic Closed");
    assert.equal(result.slots.length, 0);
  });

  it("returns holiday closure", () => {
    const result = generateSlotsForDate({
      date: "2026-07-20",
      settings: baseSettings,
      holiday: { reason: "Independence Day", isRecurring: true },
      now: new Date("2026-07-01T00:00:00.000Z"),
    });
    assert.equal(result.status, AVAILABILITY_STATUSES.HOLIDAY);
    assert.equal(result.reason, "Independence Day");
  });

  it("returns blocked for all-day override", () => {
    const result = generateSlotsForDate({
      date: "2026-07-20",
      settings: baseSettings,
      overrides: [
        {
          type: "ALL_DAY",
          startTime: null,
          endTime: null,
          reason: "Staff training",
        },
      ],
      now: new Date("2026-07-01T00:00:00.000Z"),
    });
    assert.equal(result.status, AVAILABILITY_STATUSES.BLOCKED);
    assert.equal(result.reason, "Staff training");
  });

  it("removes lunch break and partial time block", () => {
    const result = generateSlotsForDate({
      date: "2026-07-20",
      settings: {
        ...baseSettings,
        closingTime: "16:00",
        appointmentDurationMinutes: 60,
        breaks: [{ startTime: "13:00", endTime: "14:00" }],
      },
      overrides: [
        {
          type: "TIME_RANGE",
          startTime: "15:00",
          endTime: "16:00",
          reason: "Meeting",
        },
      ],
      now: new Date("2026-07-01T00:00:00.000Z"),
    });

    assert.equal(result.status, AVAILABILITY_STATUSES.AVAILABLE);
    assert.deepEqual(
      result.slots.map((slot) => slot.label),
      ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM"],
    );
  });

  it("removes overlapping appointments", () => {
    const result = generateSlotsForDate({
      date: "2026-07-20",
      settings: baseSettings,
      appointments: [
        {
          startsAt: "2026-07-20T05:00:00.000Z", // 10:30 IST
          endsAt: "2026-07-20T05:30:00.000Z",
        },
      ],
      now: new Date("2026-07-01T00:00:00.000Z"),
    });

    assert.ok(
      !result.slots.some((slot) => slot.label === "10:30 AM"),
      "booked 10:30 slot should be removed",
    );
    assert.ok(result.slots.some((slot) => slot.label === "10:00 AM"));
  });

  it("filters past times for today", () => {
    // 2026-07-20 11:15 IST = 05:45 UTC
    const result = generateSlotsForDate({
      date: "2026-07-20",
      settings: baseSettings,
      now: new Date("2026-07-20T05:45:00.000Z"),
    });

    assert.ok(result.slots.every((slot) => slot.label !== "10:00 AM"));
    assert.ok(result.slots.every((slot) => slot.label !== "10:30 AM"));
    assert.ok(result.slots.every((slot) => slot.label !== "11:00 AM"));
    assert.ok(result.slots.some((slot) => slot.label === "11:30 AM"));
  });

  it("returns past-date for dates before today", () => {
    const result = generateSlotsForDate({
      date: "2026-07-10",
      settings: baseSettings,
      now: new Date("2026-07-20T05:00:00.000Z"),
    });
    assert.equal(result.status, AVAILABILITY_STATUSES.PAST_DATE);
  });

  it("returns fully-booked when all slots taken", () => {
    const appointments = [
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
    ].map((time) => {
      const [h, m] = time.split(":").map(Number);
      // Convert IST to UTC by subtracting 5:30
      const start = new Date(Date.UTC(2026, 6, 20, h - 5, m - 30));
      const end = new Date(start.getTime() + 30 * 60_000);
      return { startsAt: start, endsAt: end };
    });

    const result = generateSlotsForDate({
      date: "2026-07-20",
      settings: baseSettings,
      appointments,
      now: new Date("2026-07-01T00:00:00.000Z"),
    });

    assert.equal(result.status, AVAILABILITY_STATUSES.FULLY_BOOKED);
    assert.equal(result.slots.length, 0);
  });

  it("respects appointment duration changes", () => {
    const result15 = generateSlotsForDate({
      date: "2026-07-20",
      settings: {
        ...baseSettings,
        closingTime: "11:00",
        appointmentDurationMinutes: 15,
      },
      now: new Date("2026-07-01T00:00:00.000Z"),
    });
    assert.equal(result15.slots.length, 4);

    const result60 = generateSlotsForDate({
      date: "2026-07-20",
      settings: {
        ...baseSettings,
        closingTime: "11:00",
        appointmentDurationMinutes: 60,
      },
      now: new Date("2026-07-01T00:00:00.000Z"),
    });
    assert.equal(result60.slots.length, 1);
    assert.equal(result60.slots[0]?.label, "10:00 AM");
  });

  it("handles timezone day-boundary consistently", () => {
    // 00:00 IST on 2026-07-20 is still 2026-07-19 in UTC.
    const result = generateSlotsForDate({
      date: "2026-07-20",
      settings: {
        ...baseSettings,
        openingTime: "00:00",
        closingTime: "01:00",
        appointmentDurationMinutes: 30,
      },
      now: new Date("2026-07-19T12:00:00.000Z"),
    });

    assert.equal(result.status, AVAILABILITY_STATUSES.AVAILABLE);
    assert.equal(result.slots[0]?.startAt, "2026-07-19T18:30:00.000Z");
    assert.equal(result.date, "2026-07-20");
  });
});
