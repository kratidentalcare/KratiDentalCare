/**
 * Idempotent migration: collapse every non-admin role to `user`.
 *
 * Rewrites historic values (`patient`, `doctor`, `staff`, `receptionist`,
 * `assistant`) so the narrowed USER_ROLE enum can be enforced on save.
 *
 *   npm run migrate:user-roles
 */

import mongoose from "mongoose";

import { LEGACY_USER_ROLES, USER_ROLES } from "@/constants/roles";
import {
  connectForSeed,
  disconnectSeed,
} from "../seed/lib/connect";
import { logInfo, logOk, logWarn } from "../seed/lib/log";

async function collapseLegacyUserRoles(): Promise<void> {
  const { dbName } = await connectForSeed("seed");
  logInfo(`Connected to ${dbName}`);

  const users = mongoose.connection.collection("users");

  const legacyFilter = {
    role: { $in: [...LEGACY_USER_ROLES] },
  };

  const legacyCount = await users.countDocuments(legacyFilter);
  if (legacyCount === 0) {
    logInfo("No legacy user roles found — nothing to migrate.");
    return;
  }

  logWarn(
    `Found ${legacyCount} user(s) with legacy roles. Updating to "${USER_ROLES.USER}"…`,
  );

  const result = await users.updateMany(legacyFilter, {
    $set: { role: USER_ROLES.USER },
  });

  logOk(
    `Migrated ${result.modifiedCount} user(s) to role "${USER_ROLES.USER}".`,
  );
}

collapseLegacyUserRoles()
  .catch((error: unknown) => {
    console.error("User role consolidation failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectSeed();
  });
