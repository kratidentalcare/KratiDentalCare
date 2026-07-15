import type { Model } from "mongoose";

import type { UserRole } from "@/constants/roles";
import type {
  SoftActivatableDocument,
  SoftDeleteQueryHelpers,
  LeanSoftActivatableDocument,
} from "@/models/base";

/**
 * Identity-layer fields for `users` (no clinical / professional domain data).
 * Domain links (`doctorId`, `patientId`) are intentionally omitted until Phase 8.x.
 *
 * @see docs/04-database-design.md §A
 * @see docs/database-architecture.md §3.1
 */
export type UserFields = {
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: UserRole;
  profileImage: string | null;
  lastLoginAt: Date | null;
  emailVerified: boolean;
  phoneVerified: boolean;
};

/** Hydrated Mongoose document for User. */
export type UserDocument = SoftActivatableDocument & UserFields;

/** Lean plain object returned by `.lean()`. */
export type LeanUser = LeanSoftActivatableDocument & UserFields;

/** Model type including soft-delete query helpers. */
export type UserModel = Model<UserDocument, SoftDeleteQueryHelpers>;
