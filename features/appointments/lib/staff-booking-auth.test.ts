import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { USER_ROLES } from "@/constants/roles";
import { canCreateStaffAppointment } from "@/features/appointments/lib/staff-booking-roles";
import { RateLimitError } from "@/lib/errors";
import { HTTP_STATUS } from "@/constants/http";
import { ERROR_CODES } from "@/constants/error-codes";
import { isLimitExceeded, windowStartFor } from "@/lib/rate-limit/window";

describe("staff booking authorization", () => {
  it("allows admin to create staff bookings", () => {
    assert.equal(canCreateStaffAppointment(USER_ROLES.ADMIN), true);
  });

  it("rejects regular users from staff booking", () => {
    assert.equal(canCreateStaffAppointment(USER_ROLES.USER), false);
  });
});

describe("booking rate limit helpers", () => {
  it("triggers after the configured max is exceeded", () => {
    assert.equal(isLimitExceeded(5, 5), false);
    assert.equal(isLimitExceeded(6, 5), true);
  });

  it("aligns window starts to the configured bucket", () => {
    const now = new Date("2026-09-13T10:00:30.000Z");
    assert.equal(
      windowStartFor(now, 60).toISOString(),
      "2026-09-13T10:00:00.000Z",
    );
  });

  it("maps RateLimitError to HTTP 429", () => {
    const error = new RateLimitError(
      "Too many booking attempts. Please wait a few minutes and try again.",
    );
    assert.equal(error.status, HTTP_STATUS.TOO_MANY_REQUESTS);
    assert.equal(error.code, ERROR_CODES.RATE_LIMITED);
  });
});
