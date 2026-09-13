import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeEmail } from "@/features/patients/lib/email";

describe("email normalization", () => {
  it("trims and lowercases email addresses", () => {
    assert.equal(normalizeEmail("  Rahul@Example.COM "), "rahul@example.com");
    assert.equal(normalizeEmail(""), null);
    assert.equal(normalizeEmail(null), null);
  });
});
