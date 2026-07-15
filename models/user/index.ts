import "server-only";

import { getOrCreateModel } from "@/models/base";

import { userSchema } from "./schema";
import type { UserDocument, UserModel } from "./types";

export const USER_MODEL_NAME = "User";

/**
 * User model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const User = getOrCreateModel<UserDocument>(
  USER_MODEL_NAME,
  userSchema,
) as UserModel;

export type { LeanUser, UserDocument, UserFields, UserModel } from "./types";
export { userSchema } from "./schema";
