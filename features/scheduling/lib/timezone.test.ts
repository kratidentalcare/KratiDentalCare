import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { addOneCivilDay } from "@/features/scheduling/lib/timezone";

describe("addOneCivilDay", () => {
  it("advances within the same month", () => {
    assert.equal(addOneCivilDay("2026-07-21"), "2026-07-22");
  });

  it("rolls across month boundaries", () => {
    assert.equal(addOneCivilDay("2026-01-31"), "2026-02-01");
  });

  it("rolls across year boundaries", () => {
    assert.equal(addOneCivilDay("2025-12-31"), "2026-01-01");
  });
});
