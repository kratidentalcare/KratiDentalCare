import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { USER_ROLES } from "@/constants/roles";
import { USER_ACCESS_STATUSES } from "@/constants/user-status";
import { userListQuerySchema } from "@/validators/user-management";

describe("user list query parsing", () => {
  it("defaults role and status to all with pagination defaults", () => {
    const parsed = userListQuerySchema.parse({});
    assert.equal(parsed.role, "all");
    assert.equal(parsed.status, "all");
    assert.equal(parsed.page, 1);
    assert.equal(parsed.limit, 20);
  });

  it("accepts role and status filters with search", () => {
    const parsed = userListQuerySchema.parse({
      role: USER_ROLES.DOCTOR,
      status: USER_ACCESS_STATUSES.DISABLED,
      search: "rahul",
      page: "2",
      limit: "10",
    });
    assert.equal(parsed.role, USER_ROLES.DOCTOR);
    assert.equal(parsed.status, USER_ACCESS_STATUSES.DISABLED);
    assert.equal(parsed.search, "rahul");
    assert.equal(parsed.page, 2);
    assert.equal(parsed.limit, 10);
  });

  it("rejects unknown role filters", () => {
    const result = userListQuerySchema.safeParse({ role: "receptionist" });
    assert.equal(result.success, false);
  });

  it("rejects invalid status filters", () => {
    const result = userListQuerySchema.safeParse({ status: "INACTIVE" });
    assert.equal(result.success, false);
  });

  it("accepts staff role filter after consolidation", () => {
    const parsed = userListQuerySchema.parse({ role: USER_ROLES.STAFF });
    assert.equal(parsed.role, USER_ROLES.STAFF);
  });
});
