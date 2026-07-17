import "server-only";

import type { SchemaDefinition } from "mongoose";

import { USER_ROLES, USER_ROLE_VALUES } from "@/constants/roles";
import { createBaseSchema } from "@/models/base";

const CLERK_ID_MAX_LENGTH = 128;
const EMAIL_MAX_LENGTH = 320;
const NAME_MAX_LENGTH = 100;
const PHONE_MAX_LENGTH = 20;
const PROFILE_IMAGE_MAX_LENGTH = 2048;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]+$/;

/**
 * User identity schema — bridges Clerk auth to app RBAC.
 * Collection: `users`
 */
export const userSchema = createBaseSchema(
  {
    clerkId: {
      type: String,
      required: [true, "clerkId is required"],
      trim: true,
      maxlength: [CLERK_ID_MAX_LENGTH, "clerkId is too long"],
      // unique creates the index — do not also set index: true
      unique: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      maxlength: [EMAIL_MAX_LENGTH, "email is too long"],
      unique: true,
      validate: {
        validator(value: string) {
          return EMAIL_PATTERN.test(value);
        },
        message: "email must be a valid email address",
      },
    },
    firstName: {
      type: String,
      default: null,
      trim: true,
      maxlength: [NAME_MAX_LENGTH, "firstName is too long"],
      set: (value: string | null) => (value === "" ? null : value),
    },
    lastName: {
      type: String,
      default: null,
      trim: true,
      maxlength: [NAME_MAX_LENGTH, "lastName is too long"],
      set: (value: string | null) => (value === "" ? null : value),
    },
    phoneNumber: {
      type: String,
      default: null,
      trim: true,
      maxlength: [PHONE_MAX_LENGTH, "phoneNumber is too long"],
      set: (value: string | null) => (value === "" ? null : value),
      validate: {
        validator(value: string | null) {
          if (value == null) {
            return true;
          }
          return value.length >= 7 && PHONE_PATTERN.test(value);
        },
        message: "phoneNumber must be a valid phone number",
      },
    },
    role: {
      type: String,
      required: [true, "role is required"],
      enum: {
        values: [...USER_ROLE_VALUES],
        message: "`{VALUE}` is not a supported user role",
      },
      default: USER_ROLES.PATIENT,
    },
    profileImage: {
      type: String,
      default: null,
      trim: true,
      maxlength: [PROFILE_IMAGE_MAX_LENGTH, "profileImage URL is too long"],
      set: (value: string | null) => (value === "" ? null : value),
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: true,
    collection: "users",
  },
);

userSchema.index({ role: 1, isActive: 1 });
