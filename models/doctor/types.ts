import type { Model, Types } from "mongoose";

import type {
  ConsultationDurationMinutes,
  Weekday,
} from "@/constants/doctor";
import type { DoctorStatus } from "@/constants/statuses";
import type {
  LeanSoftActivatableDocument,
  SoftActivatableDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Professional doctor profile fields.
 * Login/contact identity lives on `users` via optional `userId`.
 *
 * @see docs/04-database-design.md §A
 * @see docs/database-architecture.md §3.2
 */
export type DoctorFields = {
  /** Optional portal link — null until the doctor is invited to sign in. */
  userId: Types.ObjectId | null;
  /** Public / admin display name (professional, not Clerk identity). */
  fullName: string;
  /** URL-safe unique identifier for public doctor pages. */
  slug: string;
  specialties: string[];
  qualification: string | null;
  registrationNumber: string | null;
  yearsOfExperience: number | null;
  consultationFee: number | null;
  bio: string | null;
  languages: string[];
  workingDays: Weekday[];
  /** Default slot length in minutes for generator / booking hints. */
  consultationDuration: ConsultationDurationMinutes;
  /** Default clinic-day window start (`HH:mm`), before per-day slots. */
  startTime: string;
  /** Default clinic-day window end (`HH:mm`). */
  endTime: string;
  profilePhoto: string | null;
  /** Booking gate — false stops new appointments for this doctor. */
  isAvailable: boolean;
  /** Operational lifecycle (ACTIVE / INACTIVE / ON_LEAVE). */
  status: DoctorStatus;
  displayOrder: number;
};

export type DoctorDocument = SoftActivatableDocument & DoctorFields;

export type LeanDoctor = LeanSoftActivatableDocument & DoctorFields;

export type DoctorModel = Model<DoctorDocument, SoftDeleteQueryHelpers>;
