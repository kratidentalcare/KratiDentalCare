import { Types } from "mongoose";

import { OBJECT_ID_HEX_PATTERN } from "@/constants/db";

/**
 * Mongoose-oriented ObjectId helpers used by schemas and services.
 * API-boundary Zod schemas live in `@/validators` — keep both aligned.
 */

/**
 * Strict ObjectId check (24 hex chars + Mongoose validity).
 * Rejects the common false-positives of `Types.ObjectId.isValid` alone.
 */
export function isValidObjectId(value: unknown): value is string {
  if (typeof value !== "string" || !OBJECT_ID_HEX_PATTERN.test(value)) {
    return false;
  }

  return Types.ObjectId.isValid(value);
}

/**
 * Parses a string into ObjectId or returns null (never throws).
 */
export function toObjectId(value: unknown): Types.ObjectId | null {
  if (!isValidObjectId(value)) {
    return null;
  }

  return new Types.ObjectId(value);
}

/**
 * Mongoose schema path validator for ObjectId / ObjectId-string refs.
 */
export function objectIdPathValidator(value: unknown): boolean {
  if (value instanceof Types.ObjectId) {
    return true;
  }

  return isValidObjectId(value);
}

/**
 * Shared validator message for ObjectId paths.
 */
export const OBJECT_ID_VALIDATOR_MESSAGE = "Invalid ObjectId";
