import "server-only";

import type { User as ClerkUser } from "@clerk/nextjs/server";

import { LEGACY_USER_ROLES, USER_ROLES } from "@/constants/roles";
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

function accountDisabledError(message?: string): DomainError {
  return new DomainError(
    ERROR_CODES.ACCOUNT_DISABLED,
    message ?? "This account has been disabled",
    HTTP_STATUS.FORBIDDEN,
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
 * Email/password sign-up can exist in Clerk before `primaryEmailAddress` is
 * set (verification still pending). Google sign-in always has a primary email.
 * Fall back to the first address so the Mongo row is still created.
 */
function resolveClerkEmail(user: ClerkUser) {
  if (user.primaryEmailAddress?.emailAddress) {
    return user.primaryEmailAddress;
  }

  return (
    user.emailAddresses.find((address) => address.emailAddress.trim() !== "") ??
    null
  );
}

function resolveClerkPhone(user: ClerkUser) {
  if (user.primaryPhoneNumber?.phoneNumber) {
    return user.primaryPhoneNumber;
  }

  return (
    user.phoneNumbers.find((phone) => phone.phoneNumber.trim() !== "") ?? null
  );
}

/**
 * Maps a Clerk `User` into the sync DTO — Clerk-owned fields only.
 */
export function toClerkUserSyncInput(user: ClerkUser): ClerkUserSyncInput {
  const emailAddress = resolveClerkEmail(user);
  const phoneNumber = resolveClerkPhone(user);

  return {
    clerkId: user.id,
    email: emailAddress?.emailAddress ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    phoneNumber: phoneNumber?.phoneNumber ?? null,
    profileImage: user.imageUrl ?? null,
    emailVerified: emailAddress?.verification?.status === "verified",
    phoneVerified: phoneNumber?.verification?.status === "verified",
  };
}

function buildMutableProfile(
  input: ClerkUserSyncInput,
  options: SyncUserOptions,
): MutableProfileFields {
  const email = requireEmail(input.email);
  const phoneNumber = normalizePhone(input.phoneNumber);
  const touchLastLogin = options.touchLastLogin === true;

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

async function findUserByEmail(
  email: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {},
): Promise<AppUser | null> {
  const query = User.findOne({ email: email.trim().toLowerCase() });

  if (includeDeleted) {
    query.withDeleted();
  }

  return query.lean<AppUser>().exec();
}

function roleForWrite(storedRole: string | undefined): string | undefined {
  if (typeof storedRole !== "string") {
    return undefined;
  }

  if ((LEGACY_USER_ROLES as readonly string[]).includes(storedRole)) {
    return USER_ROLES.USER;
  }

  return storedRole;
}

/**
 * Clears a Clerk delete and rewrites a legacy `patient` role.
 * Uses the driver directly so the narrowed role enum cannot reject the write.
 */
async function restoreUserDocument(
  userId: AppUser["_id"],
  clerkId: string,
  fields: MutableProfileFields,
  storedRole: string | undefined,
): Promise<AppUser> {
  const role = roleForWrite(storedRole);
  const now = new Date();

  await User.collection.updateOne(
    { _id: userId },
    {
      $set: {
        clerkId,
        email: fields.email,
        firstName: fields.firstName,
        lastName: fields.lastName,
        profileImage: fields.profileImage,
        emailVerified: fields.emailVerified,
        phoneVerified: fields.phoneVerified,
        ...(fields.phoneNumber !== undefined
          ? { phoneNumber: fields.phoneNumber }
          : {}),
        ...(fields.lastLoginAt ? { lastLoginAt: fields.lastLoginAt } : {}),
        isActive: true,
        deletedAt: null,
        updatedAt: now,
        ...(typeof role === "string" ? { role } : {}),
      },
    },
  );

  const restored = await User.findById(userId).lean<AppUser>().exec();
  if (!restored) {
    throw userNotSyncedError("User disappeared during restore");
  }

  return restored;
}

/**
 * When Clerk issues a new user id for an existing verified email (instance
 * switch, re-created account), bind that row instead of inserting a duplicate.
 */
async function rebindClerkIdForEmail(
  clerkId: string,
  fields: MutableProfileFields,
  options: SyncUserOptions,
): Promise<AppUser | null> {
  const byEmail = await findUserByEmail(fields.email, { includeDeleted: true });

  if (!byEmail) {
    return null;
  }

  if (byEmail.deletedAt != null) {
    if (!options.allowRestore) {
      return null;
    }

    const restored = await restoreUserDocument(
      byEmail._id,
      clerkId,
      fields,
      byEmail.role,
    );
    logger.info("Restored soft-deleted user for recreated Clerk account", {
      clerkId,
    });
    return restored;
  }

  if (!byEmail.isActive) {
    return null;
  }

  if (byEmail.clerkId === clerkId) {
    return byEmail;
  }

  const rebound = await User.findOneAndUpdate(
    { _id: byEmail._id, deletedAt: null },
    { $set: { clerkId, ...fields } },
    { returnDocument: "after", runValidators: true },
  )
    .lean<AppUser>()
    .exec();

  if (!rebound) {
    return null;
  }

  logger.warn("Rebound Clerk user id onto existing email", {
    email: fields.email,
    previousClerkId: byEmail.clerkId,
    clerkId,
  });

  return rebound;
}

async function updateMutableProfile(
  clerkId: string,
  fields: MutableProfileFields,
): Promise<AppUser> {
  // Never include role / isActive / deletedAt — application-managed only.
  const updated = await User.findOneAndUpdate(
    { clerkId },
    { $set: fields },
    { returnDocument: "after", runValidators: true },
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
      role: USER_ROLES.USER,
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
 * - Creates a user-default row when `clerkId` is new
 * - Updates Clerk-owned profile fields when the row exists and is usable
 * - Rejects soft-deleted / inactive accounts as `ACCOUNT_DISABLED` (no mutation)
 * - When `allowRestore` is set, a soft-deleted row is shown in the user list again
 * - Never overwrites an active account's role from Clerk
 */
export async function syncUser(
  input: ClerkUserSyncInput,
  options: SyncUserOptions = {},
): Promise<AppUser> {
  await ensureDatabase();

  const clerkId = parseClerkId(input.clerkId);
  const fields = buildMutableProfile(input, options);

  const existing = await findUserByClerkId(clerkId, { includeDeleted: true });

  // Soft-deleted / inactive accounts must not be mutated during login sync.
  // Clerk `user.created` may restore a row hidden from the dashboard.
  if (existing?.deletedAt != null) {
    if (options.allowRestore) {
      return restoreUserDocument(existing._id, clerkId, fields, existing.role);
    }

    logger.warn("Rejected soft-deleted app user during sync", { clerkId });
    throw accountDisabledError(
      "This account has been deactivated and cannot be synchronized",
    );
  }

  if (existing && !existing.isActive) {
    logger.warn("Rejected inactive app user during sync", { clerkId });
    throw accountDisabledError();
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
    const rebound = await rebindClerkIdForEmail(clerkId, fields, options);
    if (rebound) {
      return rebound;
    }

    const created = await createUserFromSyncInput(clerkId, fields);
    logger.info("User created from Clerk sync", {
      clerkId,
      role: USER_ROLES.USER,
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

/**
 * Soft-disables the Mongo user for a Clerk `user.deleted` event.
 * Missing rows are a no-op. Clinical data is left in place.
 *
 * @returns Whether a row was newly deactivated.
 */
export async function deactivateUserByClerkId(
  clerkId: string,
): Promise<boolean> {
  await ensureDatabase();

  const id = parseClerkId(clerkId);
  const now = new Date();

  // Native collection write skips Mongoose validators. Rows created before
  // the role enum narrowed still store `patient`, and `save()` rejects them.
  const users = User.collection;
  const existing = await users.findOne<{
    _id: unknown;
    role?: string;
    isActive?: boolean;
    deletedAt?: Date | null;
  }>({ clerkId: id });

  if (!existing) {
    logger.info("Clerk user delete had no Mongo row", { clerkId: id });
    return false;
  }

  const storedRole = existing.role;
  const role =
    typeof storedRole === "string" &&
    (LEGACY_USER_ROLES as readonly string[]).includes(storedRole)
      ? USER_ROLES.USER
      : storedRole;

  const alreadyDeactivated =
    existing.deletedAt != null &&
    existing.isActive === false &&
    role === storedRole;

  if (alreadyDeactivated) {
    return false;
  }

  await users.updateOne(
    { _id: existing._id },
    {
      $set: {
        isActive: false,
        deletedAt: existing.deletedAt ?? now,
        updatedAt: now,
        ...(typeof role === "string" ? { role } : {}),
      },
    },
  );

  logger.info("Soft-deleted app user from Clerk", { clerkId: id });
  return true;
}
