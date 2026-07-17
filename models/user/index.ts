import "server-only";

import { getOrCreateModel } from "@/models/base";

import { USER_MODEL_NAME } from "./constants";
import { userSchema } from "./schema";
import type { UserDocument, UserModel } from "./types";

/**
 * User model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const User = getOrCreateModel<UserDocument>(
  USER_MODEL_NAME,
  userSchema,
) as UserModel;

export { USER_MODEL_NAME } from "./constants";
export type { LeanUser, UserDocument, UserFields, UserModel } from "./types";
export { userSchema } from "./schema";
