import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildUserListFilter } from "@/features/users/lib/list-filter";
import {
  escapeRegex,
  phoneSearchDigits,
} from "@/features/users/lib/search";
import {
  accessStatusFromIsActive,
  isActiveFromAccessStatus,
  mongoAccessStatusFilter,
} from "@/features/users/lib/status";
import {
  USER_ACCESS_STATUSES,
} from "@/constants/user-status";

describe("user access status helpers", () => {
  it("maps isActive to ACTIVE/DISABLED", () => {
    assert.equal(accessStatusFromIsActive(true), USER_ACCESS_STATUSES.ACTIVE);
    assert.equal(
      accessStatusFromIsActive(false),
      USER_ACCESS_STATUSES.DISABLED,
    );
  });

  it("maps access status back to isActive", () => {
    assert.equal(
      isActiveFromAccessStatus(USER_ACCESS_STATUSES.ACTIVE),
      true,
    );
    assert.equal(
      isActiveFromAccessStatus(USER_ACCESS_STATUSES.DISABLED),
      false,
    );
  });

  it("builds mongo status filters", () => {
    assert.deepEqual(mongoAccessStatusFilter("all"), null);
    assert.deepEqual(mongoAccessStatusFilter(USER_ACCESS_STATUSES.ACTIVE), {
      isActive: true,
    });
    assert.deepEqual(mongoAccessStatusFilter(USER_ACCESS_STATUSES.DISABLED), {
      isActive: false,
    });
  });
});

describe("user search helpers", () => {
  it("escapes regex metacharacters", () => {
    assert.equal(escapeRegex("a+b*(c)"), "a\\+b\\*\\(c\\)");
  });

  it("extracts phone digits when enough are present", () => {
    assert.equal(phoneSearchDigits("call 98765"), "98765");
    assert.equal(phoneSearchDigits("ab"), null);
  });
});

describe("user list filter builder", () => {
  it("always excludes soft-deleted users", () => {
    const filter = buildUserListFilter({
      search: undefined,
      role: "all",
      status: "all",
    });
    assert.deepEqual(filter, { deletedAt: null });
  });

  it("applies role, status, and escaped search together", () => {
    const filter = buildUserListFilter({
      search: "Rahul",
      role: "doctor",
      status: USER_ACCESS_STATUSES.ACTIVE,
    });

    assert.equal(filter.deletedAt, null);
    assert.equal(filter.role, "doctor");
    assert.equal(filter.isActive, true);
    assert.ok(filter.$or);
  });
});
