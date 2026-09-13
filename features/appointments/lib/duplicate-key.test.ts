import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classifyBookingDuplicateKey } from "@/features/appointments/lib/duplicate-key";

function duplicateError(keyPattern: Record<string, number>): Error & {
  code: number;
  keyPattern: Record<string, number>;
} {
  const error = new Error("E11000 duplicate key") as Error & {
    code: number;
    keyPattern: Record<string, number>;
  };
  error.code = 11000;
  error.keyPattern = keyPattern;
  return error;
}

describe("booking duplicate-key mapping", () => {
  it("maps occupancyKey to a slot conflict", () => {
    assert.equal(
      classifyBookingDuplicateKey(duplicateError({ occupancyKey: 1 })),
      "slot",
    );
  });

  it("maps activePatientHold to a duplicate-patient conflict", () => {
    assert.equal(
      classifyBookingDuplicateKey(duplicateError({ activePatientHold: 1 })),
      "active-patient",
    );
  });

  it("maps bookingReference to idempotency", () => {
    assert.equal(
      classifyBookingDuplicateKey(duplicateError({ bookingReference: 1 })),
      "idempotency",
    );
  });
});
