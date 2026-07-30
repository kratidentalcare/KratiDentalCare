/**
 * Idempotent migration: consolidate legacy receptionist/assistant roles → staff.
 *
 * Run before deploying the narrowed USER_ROLE enum:
 *   npx tsx --import ./scripts/seed/preload.ts ./scripts/migrations/consolidate-staff-roles.ts
 */

import mongoose from "mongoose";

import { LEGACY_STAFF_ROLES, USER_ROLES } from "@/constants/roles";
import {
  connectForSeed,
  disconnectSeed,
} from "../seed/lib/connect";
import { logInfo, logOk, logWarn } from "../seed/lib/log";

async function consolidateStaffRoles(): Promise<void> {
  const { dbName } = await connectForSeed("seed");
  logInfo(`Connected to ${dbName}`);

  const users = mongoose.connection.collection("users");

  const legacyFilter = {
    role: { $in: [...LEGACY_STAFF_ROLES] },
  };

  const legacyCount = await users.countDocuments(legacyFilter);
  if (legacyCount === 0) {
    logInfo("No legacy receptionist/assistant users found — nothing to migrate.");
    return;
  }

  logWarn(
    `Found ${legacyCount} user(s) with legacy staff roles. Updating to "${USER_ROLES.STAFF}"…`,
  );

  const result = await users.updateMany(legacyFilter, {
    $set: { role: USER_ROLES.STAFF },
  });

  logOk(
    `Migrated ${result.modifiedCount} user(s) to role "${USER_ROLES.STAFF}".`,
  );
}

consolidateStaffRoles()
  .catch((error: unknown) => {
    console.error("Staff role consolidation failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectSeed();
  });
