import { z } from "zod";

import { USER_ROLES, USER_ROLE_VALUES } from "@/constants/roles";
import {
  emailSchema,
  isActiveSchema,
  nonEmptyStringSchema,
  phoneSchema,
  userRoleSchema,
} from "@/validators/common";

/**
 * Zod contracts for User identity fields (persistence / sync boundary).
 * Not an API surface — Server Actions will reuse these later.
 */

export const clerkIdSchema = nonEmptyStringSchema.max(
  128,
  "clerkId is too long",
);

export const userNameSchema = z
  .string()
  .trim()
  .max(100, "Name is too long")
  .nullable()
  .optional();

export const profileImageSchema = z
  .string()
  .trim()
  .url("profileImage must be a valid URL")
  .max(2048)
  .nullable()
  .optional();

/** Fields accepted when creating/bootstrapping a user row. */
export const createUserSchema = z.object({
  clerkId: clerkIdSchema,
  email: emailSchema,
  firstName: userNameSchema,
  lastName: userNameSchema,
  phoneNumber: phoneSchema.nullable().optional(),
  role: userRoleSchema.default(USER_ROLES.PATIENT),
  profileImage: profileImageSchema,
  isActive: isActiveSchema.optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  lastLoginAt: z.coerce.date().nullable().optional(),
});

/** Partial update — never accept `clerkId` changes from clients. */
export const updateUserSchema = z
  .object({
    email: emailSchema.optional(),
    firstName: userNameSchema,
    lastName: userNameSchema,
    phoneNumber: phoneSchema.nullable().optional(),
    role: userRoleSchema.optional(),
    profileImage: profileImageSchema,
    isActive: isActiveSchema.optional(),
    emailVerified: z.boolean().optional(),
    phoneVerified: z.boolean().optional(),
    lastLoginAt: z.coerce.date().nullable().optional(),
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/** Re-export role values for consumers that validate against the model. */
export const userModelRoleValues = USER_ROLE_VALUES;
