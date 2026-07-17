import {
  PATIENT_STATUSES,
  type PatientStatus,
} from "@/constants/statuses";

export type PatientActiveFilter = "active" | "inactive" | "all";

/** Keep `status` and `isActive` synchronized for Active / Inactive charts. */
export function syncPatientActiveFields(status: PatientStatus): {
  status: PatientStatus;
  isActive: boolean;
} {
  if (status === PATIENT_STATUSES.ACTIVE) {
    return { status: PATIENT_STATUSES.ACTIVE, isActive: true };
  }

  if (status === PATIENT_STATUSES.INACTIVE) {
    return { status: PATIENT_STATUSES.INACTIVE, isActive: false };
  }

  return { status: PATIENT_STATUSES.ARCHIVED, isActive: false };
}

export function patientStatusMatchesFilter(
  status: PatientStatus,
  filter: PatientActiveFilter,
): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "active") {
    return status === PATIENT_STATUSES.ACTIVE;
  }
  return status === PATIENT_STATUSES.INACTIVE;
}

export function mongoStatusFilter(
  filter: PatientActiveFilter,
): Record<string, unknown> | null {
  if (filter === "active") {
    return { status: PATIENT_STATUSES.ACTIVE, isActive: true };
  }
  if (filter === "inactive") {
    return { status: PATIENT_STATUSES.INACTIVE };
  }
  return null;
}
