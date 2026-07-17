import type { Model, Types } from "mongoose";

import type {
  BloodGroup,
  EmergencyContactRelationship,
  Gender,
} from "@/constants/patient";
import type { PatientStatus } from "@/constants/statuses";
import type {
  LeanSoftActivatableDocument,
  SoftActivatableDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Embedded postal address (omit entirely when unknown).
 */
export type PatientAddress = {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

/**
 * Clinical / demographic patient fields.
 * Portal login identity lives on `users` via optional `userId`.
 *
 * `fullName` + `phone` are clinic CRM contacts for walk-ins (no User yet),
 * not Clerk identity duplicates.
 *
 * @see docs/04-database-design.md §A
 * @see docs/database-architecture.md §3.3
 */
export type PatientFields = {
  /** Optional portal link — null for walk-in / phone bookings. */
  userId: Types.ObjectId | null;
  /** Chart / admin display name (required even without portal user). */
  fullName: string;
  /** Primary clinic contact phone (reminders / walk-ins). */
  phone: string;
  /**
   * Normalized phone used as unique booking identity.
   * Digits with optional leading `+`; lazily backfilled for legacy rows.
   */
  canonicalPhone: string;
  /** Optional clinic email (sparse unique when present). */
  email: string | null;
  gender: Gender | null;
  dateOfBirth: Date | null;
  bloodGroup: BloodGroup | null;
  address: PatientAddress | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  relationship: EmergencyContactRelationship | null;
  allergies: string[];
  chronicConditions: string[];
  medicalNotes: string | null;
  status: PatientStatus;
};

export type PatientDocument = SoftActivatableDocument & PatientFields;

export type LeanPatient = LeanSoftActivatableDocument & PatientFields;

export type PatientModel = Model<PatientDocument, SoftDeleteQueryHelpers>;
