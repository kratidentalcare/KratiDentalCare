import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { USER_ROLES } from "@/constants/roles";
import { USER_ACCESS_STATUSES } from "@/constants/user-status";
import { ForbiddenError } from "@/lib/errors";
import {
  assertCanChangeOwnAccessStatus,
  assertCanChangeOwnRole,
  canDisableInUi,
  isSelfTarget,
} from "@/features/users/lib/self-protection";

describe("user management self-protection", () => {
  const actorId = "507f1f77bcf86cd799439011";
  const otherId = "507f1f77bcf86cd799439012";

  it("identifies self targets", () => {
    assert.equal(isSelfTarget(actorId, actorId), true);
    assert.equal(isSelfTarget(actorId, otherId), false);
  });

  it("blocks self-demotion from ADMIN", () => {
    assert.throws(
      () =>
        assertCanChangeOwnRole(
          actorId,
          actorId,
          USER_ROLES.ADMIN,
          USER_ROLES.STAFF,
        ),
      (error: unknown) => error instanceof ForbiddenError,
    );
  });

  it("allows self role change that keeps ADMIN", () => {
    assert.doesNotThrow(() =>
      assertCanChangeOwnRole(
        actorId,
        actorId,
        USER_ROLES.ADMIN,
        USER_ROLES.ADMIN,
      ),
    );
  });

  it("allows changing another user's role including demotion", () => {
    assert.doesNotThrow(() =>
      assertCanChangeOwnRole(
        actorId,
        otherId,
        USER_ROLES.ADMIN,
        USER_ROLES.DOCTOR,
      ),
    );
  });

  it("blocks self-disable", () => {
    assert.throws(
      () =>
        assertCanChangeOwnAccessStatus(
          actorId,
          actorId,
          USER_ACCESS_STATUSES.DISABLED,
        ),
      (error: unknown) => error instanceof ForbiddenError,
    );
  });

  it("allows enabling own account (no-op path)", () => {
    assert.doesNotThrow(() =>
      assertCanChangeOwnAccessStatus(
        actorId,
        actorId,
        USER_ACCESS_STATUSES.ACTIVE,
      ),
    );
  });

  it("allows disabling another user", () => {
    assert.doesNotThrow(() =>
      assertCanChangeOwnAccessStatus(
        actorId,
        otherId,
        USER_ACCESS_STATUSES.DISABLED,
      ),
    );
  });

  it("disables disable control in UI for self", () => {
    assert.equal(canDisableInUi(actorId, actorId), false);
    assert.equal(canDisableInUi(actorId, otherId), true);
  });
});
