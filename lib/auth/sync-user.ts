import "server-only";

import type { User as ClerkUser } from "@clerk/nextjs/server";

import { USER_ROLES } from "@/constants/roles";
import { ERROR_CODES } from "@/constants/error-codes";
import { HTTP_STATUS } from "@/constants/http";
import { connect } from "@/lib/db";
import {
  AppError,
  ConflictError,
  DomainError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import { User, type LeanUser } from "@/models/user";
import {
  clerkIdSchema,
  profileImageSchema,
  userNameSchema,
} from "@/validators/user";
import { emailSchema, phoneSchema } from "@/validators/common";

import type { ClerkUserSyncInput, SyncUserOptions } from "./types";

/** Application user returned after Clerk → Mongo synchronization. */
export type AppUser = LeanUser;

type MutableProfileFields = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  phoneNumber?: string | null;
  lastLoginAt?: Date;
};

type MongoDuplicateKeyError = {
  code: 11000;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
};

function isMongoDuplicateKeyError(
  error: unknown,
): error is MongoDuplicateKeyError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

function duplicateKeyIncludes(
  error: MongoDuplicateKeyError,
  field: string,
): boolean {
  if (error.keyPattern && field in error.keyPattern) {
    return true;
  }
  if (error.keyValue && field in error.keyValue) {
    return true;
  }
  return false;
}

function databaseUnavailableError(cause: unknown): AppError {
  return new AppError({
    code: ERROR_CODES.INTERNAL_ERROR,
    message: "Unable to synchronize user at this time",
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    cause,
  });
}

function userNotSyncedError(message: string): DomainError {
  return new DomainError(
    ERROR_CODES.USER_NOT_SYNCED,
    message,
    HTTP_STATUS.UNAUTHORIZED,
  );
}

async function ensureDatabase(): Promise<void> {
  try {
    await connect();
  } catch (error) {
    logger.error("Database unavailable during user sync", error);
    throw databaseUnavailableError(error);
  }
}

function normalizeName(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  const parsed = userNameSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }

  return parsed.data ?? null;
}

function normalizePhone(value: string | null | undefined): string | null {
  if (value == null || value.trim() === "") {
    return null;
  }

  const parsed = phoneSchema.safeParse(value);
  if (!parsed.success) {
    logger.warn("Skipping invalid Clerk phone number during user sync");
    return null;
  }

  return parsed.data;
}

function normalizeProfileImage(
  value: string | null | undefined,
): string | null {
  if (value == null || value.trim() === "") {
    return null;
  }

  const parsed = profileImageSchema.safeParse(value);
  if (!parsed.success) {
    logger.warn("Skipping invalid Clerk profile image during user sync");
    return null;
  }

  return parsed.data ?? null;
}

function parseClerkId(clerkId: string): string {
  const parsed = clerkIdSchema.safeParse(clerkId);
  if (!parsed.success) {
    throw new ValidationError("Invalid Clerk user id", [
      { field: "clerkId", message: "clerkId is required and must be valid" },
    ]);
  }

  return parsed.data;
}

function requireEmail(email: string | null): string {
  if (!email) {
    throw new ValidationError("Clerk user has no email address", [
      { field: "email", message: "Email is required to synchronize the user" },
    ]);
  }

  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    throw new ValidationError("Clerk user email is invalid", [
      { field: "email", message: "Email must be a valid email address" },
    ]);
  }

  return parsed.data;
}

/**
 * Maps a Clerk `User` into the sync DTO — Clerk-owned fields only.
 */
export function toClerkUserSyncInput(user: ClerkUser): ClerkUserSyncInput {
  const primaryEmail = user.primaryEmailAddress;
  const primaryPhone = user.primaryPhoneNumber;

  return {
    clerkId: user.id,
    email: primaryEmail?.emailAddress ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    phoneNumber: primaryPhone?.phoneNumber ?? null,
    profileImage: user.imageUrl ?? null,
    emailVerified: primaryEmail?.verification?.status === "verified",
    phoneVerified: primaryPhone?.verification?.status === "verified",
  };
}

function buildMutableProfile(
  input: ClerkUserSyncInput,
  options: SyncUserOptions,
): MutableProfileFields {
  const email = requireEmail(input.email);
  const phoneNumber = normalizePhone(input.phoneNumber);
  const touchLastLogin = options.touchLastLogin !== false;

  const fields: MutableProfileFields = {
    email,
    firstName: normalizeName(input.firstName),
    lastName: normalizeName(input.lastName),
    profileImage: normalizeProfileImage(input.profileImage),
    emailVerified: input.emailVerified,
    phoneVerified: input.phoneVerified,
  };

  // Only write phone when Clerk provides one — preserve existing otherwise.
  if (phoneNumber !== null) {
    fields.phoneNumber = phoneNumber;
  }

  if (touchLastLogin) {
    fields.lastLoginAt = new Date();
  }

  return fields;
}

async function findUserByClerkId(
  clerkId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {},
): Promise<AppUser | null> {
  const query = User.findOne({ clerkId });

  if (includeDeleted) {
    query.withDeleted();
  }

  return query.lean<AppUser>().exec();
}

async function updateMutableProfile(
  clerkId: string,
  fields: MutableProfileFields,
): Promise<AppUser> {
  // Never include role / isActive / deletedAt — application-managed only.
  const updated = await User.findOneAndUpdate(
    { clerkId },
    { $set: fields },
    { new: true, runValidators: true },
  )
    .lean<AppUser>()
    .exec();

  if (!updated) {
    throw userNotSyncedError("User disappeared during synchronization");
  }

  return updated;
}

async function createUserFromSyncInput(
  clerkId: string,
  fields: MutableProfileFields,
): Promise<AppUser> {
  try {
    const created = await User.create({
      clerkId,
      email: fields.email,
      firstName: fields.firstName,
      lastName: fields.lastName,
      phoneNumber: fields.phoneNumber ?? null,
      profileImage: fields.profileImage,
      emailVerified: fields.emailVerified,
      phoneVerified: fields.phoneVerified,
      lastLoginAt: fields.lastLoginAt ?? null,
      // Explicit defaults — never accept these from Clerk.
      role: USER_ROLES.PATIENT,
      isActive: true,
    });

    return created.toObject() as AppUser;
  } catch (error) {
    if (!isMongoDuplicateKeyError(error)) {
      throw error;
    }

    // Concurrent first-login race on clerkId — treat as idempotent update.
    if (duplicateKeyIncludes(error, "clerkId")) {
      logger.warn("Concurrent user sync raced on clerkId; applying update", {
        clerkId,
      });
      return updateMutableProfile(clerkId, fields);
    }

    if (duplicateKeyIncludes(error, "email")) {
      throw new ConflictError(
        "A user with this email already exists",
        ERROR_CODES.CONFLICT,
      );
    }

    throw new ConflictError(
      "Unable to create user due to a uniqueness conflict",
      ERROR_CODES.CONFLICT,
    );
  }
}

/**
 * Idempotently synchronizes a Clerk identity into the MongoDB `users` collection.
 *
 * - Creates a patient-default row when `clerkId` is new
 * - Updates Clerk-owned profile fields when the row exists
 * - Never overwrites application-managed fields (`role`, `isActive`, …)
 */
export async function syncUser(
  input: ClerkUserSyncInput,
  options: SyncUserOptions = {},
): Promise<AppUser> {
  await ensureDatabase();

  const clerkId = parseClerkId(input.clerkId);
  const fields = buildMutableProfile(input, options);

  const existing = await findUserByClerkId(clerkId, { includeDeleted: true });

  if (existing?.deletedAt != null) {
    throw userNotSyncedError(
      "This account has been deactivated and cannot be synchronized",
    );
  }

  if (existing) {
    try {
      const updated = await updateMutableProfile(clerkId, fields);
      logger.debug("User profile synchronized", { clerkId });
      return updated;
    } catch (error) {
      if (
        isMongoDuplicateKeyError(error) &&
        duplicateKeyIncludes(error, "email")
      ) {
        throw new ConflictError(
          "A user with this email already exists",
          ERROR_CODES.CONFLICT,
        );
      }

      if (error instanceof AppError) {
        throw error;
      }

      logger.error("Failed to update synchronized user", error, { clerkId });
      throw databaseUnavailableError(error);
    }
  }

  try {
    const created = await createUserFromSyncInput(clerkId, fields);
    logger.info("User created from Clerk sync", {
      clerkId,
      role: USER_ROLES.PATIENT,
    });
    return created;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error("Failed to create synchronized user", error, { clerkId });
    throw databaseUnavailableError(error);
  }
}

/**
 * Convenience: map + sync a Clerk `User` resource in one call.
 */
export async function syncClerkUser(
  user: ClerkUser,
  options: SyncUserOptions = {},
): Promise<AppUser> {
  return syncUser(toClerkUserSyncInput(user), options);
}
