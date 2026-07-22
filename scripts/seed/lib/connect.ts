import mongoose from "mongoose";

import { requireMongoUri } from "@/config/env";
import { DEFAULT_MONGO_CONNECT_OPTIONS } from "@/lib/db/constants";

import { loadEnvFiles } from "./load-env";
import {
  assertDemoResetAllowed,
  assertSeedEnvironmentAllowed,
} from "./safety";

export type SeedConnection = {
  uri: string;
  dbName: string;
};

/**
 * Connect for CLI seed scripts. Loads env files, enforces safety gates,
 * and opens a dedicated mongoose connection (independent of Next.js cache).
 */
export async function connectForSeed(
  mode: "seed" | "reset" = "seed",
): Promise<SeedConnection> {
  loadEnvFiles();

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "development";
  }

  assertSeedEnvironmentAllowed();

  const uri = requireMongoUri();
  await mongoose.connect(uri, DEFAULT_MONGO_CONNECT_OPTIONS);

  const dbName = mongoose.connection.name || "(unknown)";

  if (mode === "reset") {
    try {
      assertDemoResetAllowed(uri, dbName);
    } catch (error) {
      await mongoose.disconnect();
      throw error;
    }
  }

  return { uri, dbName };
}

export async function disconnectSeed(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
