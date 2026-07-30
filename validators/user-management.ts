import { z } from "zod";

import { USER_ROLES } from "@/constants/roles";
import {
  USER_ACCESS_STATUSES,
  USER_ACCESS_STATUS_VALUES,
} from "@/constants/user-status";
import { objectIdSchema, userRoleSchema } from "@/validators/common";
import { paginationQuerySchema } from "@/validators/pagination";

export const userAccessStatusSchema = z.enum(USER_ACCESS_STATUS_VALUES);

export const userRoleFilterSchema = z.enum([
  "all",
  USER_ROLES.ADMIN,
  USER_ROLES.DOCTOR,
  USER_ROLES.STAFF,
  USER_ROLES.PATIENT,
]);

export const userStatusFilterSchema = z.enum([
  "all",
  USER_ACCESS_STATUSES.ACTIVE,
  USER_ACCESS_STATUSES.DISABLED,
]);

/** Dashboard Users list query (URL search params). */
export const userListQuerySchema = paginationQuerySchema.extend({
  role: userRoleFilterSchema.default("all"),
  status: userStatusFilterSchema.default("all"),
});

export const updateUserRoleSchema = z.object({
  userId: objectIdSchema,
  role: userRoleSchema,
});

export const updateUserAccessStatusSchema = z.object({
  userId: objectIdSchema,
  status: userAccessStatusSchema,
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserAccessStatusInput = z.infer<
  typeof updateUserAccessStatusSchema
>;
