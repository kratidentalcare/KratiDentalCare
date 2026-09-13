import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  escapeRegex,
  indianMobileDigits,
  normalizePhone,
  phoneIdentityKeys,
  phoneSearchDigits,
  phonesShareIdentity,
  toCanonicalPhone,
  toDisplayPhone,
} from "@/features/patients/lib/phone";

describe("patient phone normalization", () => {
  it("normalizes spaced and punctuated phones to digits", () => {
    assert.equal(normalizePhone("98765 43210"), "9876543210");
    assert.equal(normalizePhone("(987) 654-3210"), "9876543210");
  });

  it("preserves a leading plus for international numbers", () => {
    assert.equal(normalizePhone("+91 98765 43210"), "+919876543210");
  });

  it("compacts display phones without stripping punctuation", () => {
    assert.equal(toDisplayPhone("  98765   43210  "), "98765 43210");
  });

  it("extracts phone search digits only when enough digits exist", () => {
    assert.equal(phoneSearchDigits("Ada"), null);
    assert.equal(phoneSearchDigits("98"), null);
    assert.equal(phoneSearchDigits("987"), "987");
    assert.equal(phoneSearchDigits("call 987-65"), "98765");
  });

  it("escapes regex metacharacters in search terms", () => {
    assert.equal(escapeRegex("a+b.c"), "a\\+b\\.c");
  });

  it("treats 10-digit and +91 formatted Indian mobiles as the same identity", () => {
    assert.equal(indianMobileDigits("9876543210"), "9876543210");
    assert.equal(indianMobileDigits("+91 98765 43210"), "9876543210");
    assert.equal(toCanonicalPhone("9876543210"), "+919876543210");
    assert.equal(toCanonicalPhone("+91 98765 43210"), "+919876543210");
    assert.equal(
      phonesShareIdentity("9876543210", "+91 98765 43210"),
      true,
    );
    assert.ok(phoneIdentityKeys("9876543210").includes("+919876543210"));
  });
});
