import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { patientListQuerySchema } from "@/validators/patient";

describe("patient list query parsing", () => {
  it("defaults status to all and applies pagination defaults", () => {
    const parsed = patientListQuerySchema.parse({});
    assert.equal(parsed.status, "all");
    assert.equal(parsed.page, 1);
    assert.equal(parsed.limit, 20);
  });

  it("accepts active and inactive filters with search", () => {
    const parsed = patientListQuerySchema.parse({
      status: "inactive",
      search: "98765",
      page: "2",
      limit: "10",
    });
    assert.equal(parsed.status, "inactive");
    assert.equal(parsed.search, "98765");
    assert.equal(parsed.page, 2);
    assert.equal(parsed.limit, 10);
  });

  it("rejects unknown status filters", () => {
    const result = patientListQuerySchema.safeParse({ status: "archived" });
    assert.equal(result.success, false);
  });
});
