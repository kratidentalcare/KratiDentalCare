import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ValidationError } from "@/lib/errors";
import {
  assertPublicBookingBotProtection,
  isHoneypotTriggered,
} from "@/features/appointments/lib/bot-protection";

describe("public booking bot protection", () => {
  it("ignores empty honeypot values", () => {
    assert.equal(isHoneypotTriggered(""), false);
    assert.equal(isHoneypotTriggered("   "), false);
    assert.doesNotThrow(() =>
      assertPublicBookingBotProtection({ website: "" }),
    );
  });

  it("rejects filled honeypot fields without naming bots", () => {
    assert.equal(isHoneypotTriggered("https://spam.test"), true);
    assert.throws(
      () => assertPublicBookingBotProtection({ website: "https://spam.test" }),
      (error: unknown) =>
        error instanceof ValidationError &&
        error.message === "Unable to submit booking",
    );
  });
});
