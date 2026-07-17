import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PATIENT_STATUSES } from "@/constants/statuses";
import {
  mongoStatusFilter,
  patientStatusMatchesFilter,
  syncPatientActiveFields,
} from "@/features/patients/lib/status";

describe("patient status synchronization", () => {
  it("keeps Active charts isActive true", () => {
    assert.deepEqual(syncPatientActiveFields(PATIENT_STATUSES.ACTIVE), {
      status: PATIENT_STATUSES.ACTIVE,
      isActive: true,
    });
  });

  it("keeps Inactive charts isActive false", () => {
    assert.deepEqual(syncPatientActiveFields(PATIENT_STATUSES.INACTIVE), {
      status: PATIENT_STATUSES.INACTIVE,
      isActive: false,
    });
  });

  it("treats Archived as inactive for sync", () => {
    assert.deepEqual(syncPatientActiveFields(PATIENT_STATUSES.ARCHIVED), {
      status: PATIENT_STATUSES.ARCHIVED,
      isActive: false,
    });
  });

  it("matches active filter only for ACTIVE status", () => {
    assert.equal(
      patientStatusMatchesFilter(PATIENT_STATUSES.ACTIVE, "active"),
      true,
    );
    assert.equal(
      patientStatusMatchesFilter(PATIENT_STATUSES.INACTIVE, "active"),
      false,
    );
  });

  it("builds mongo filters for active and inactive lists", () => {
    assert.deepEqual(mongoStatusFilter("active"), {
      status: PATIENT_STATUSES.ACTIVE,
      isActive: true,
    });
    assert.deepEqual(mongoStatusFilter("inactive"), {
      status: PATIENT_STATUSES.INACTIVE,
    });
    assert.equal(mongoStatusFilter("all"), null);
  });
});
