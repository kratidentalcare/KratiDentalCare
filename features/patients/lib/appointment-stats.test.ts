import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import {
  classifyAppointmentForStats,
  isUpcomingAppointmentCandidate,
} from "@/features/patients/lib/appointment-stats";

describe("patient appointment statistics", () => {
  it("counts completed and cancelled statuses correctly", () => {
    assert.deepEqual(
      classifyAppointmentForStats(APPOINTMENT_STATUSES.COMPLETED),
      { total: true, completed: true, cancelled: false },
    );
    assert.deepEqual(
      classifyAppointmentForStats(APPOINTMENT_STATUSES.CANCELLED),
      { total: true, completed: false, cancelled: true },
    );
    assert.deepEqual(
      classifyAppointmentForStats(APPOINTMENT_STATUSES.PENDING),
      { total: true, completed: false, cancelled: false },
    );
  });

  it("excludes archived appointments from totals", () => {
    assert.deepEqual(
      classifyAppointmentForStats(APPOINTMENT_STATUSES.ARCHIVED),
      { total: false, completed: false, cancelled: false },
    );
  });

  it("treats future non-terminal appointments as upcoming", () => {
    const now = new Date("2026-07-17T10:00:00.000Z");
    const future = new Date("2026-07-18T10:00:00.000Z");
    const past = new Date("2026-07-16T10:00:00.000Z");

    assert.equal(
      isUpcomingAppointmentCandidate(
        APPOINTMENT_STATUSES.CONFIRMED,
        future,
        now,
      ),
      true,
    );
    assert.equal(
      isUpcomingAppointmentCandidate(
        APPOINTMENT_STATUSES.COMPLETED,
        future,
        now,
      ),
      false,
    );
    assert.equal(
      isUpcomingAppointmentCandidate(
        APPOINTMENT_STATUSES.PENDING,
        past,
        now,
      ),
      false,
    );
  });
});
