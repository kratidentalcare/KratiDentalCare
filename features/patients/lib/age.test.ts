import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculateAgeYears } from "@/features/prescriptions/lib/age";
import { dateOfBirthFromAgeYears } from "@/features/patients/lib/age";

describe("dateOfBirthFromAgeYears", () => {
  it("round-trips with calculateAgeYears", () => {
    const at = new Date(2026, 6, 18, 15, 0, 0);
    const dob = dateOfBirthFromAgeYears(32, at);
    assert.equal(calculateAgeYears(dob, at), 32);
  });

  it("supports newborn age 0", () => {
    const at = new Date(2026, 6, 18);
    const dob = dateOfBirthFromAgeYears(0, at);
    assert.equal(calculateAgeYears(dob, at), 0);
  });
});
