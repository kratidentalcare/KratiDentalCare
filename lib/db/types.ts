import type mongoose from "mongoose";

import type { MongoReadyState } from "@/lib/db/constants";

/**
 * Global singleton cache used across Next.js hot reloads and serverless
 * warm starts. Stored on `globalThis` so HMR does not create multiple pools.
 */
export type MongooseConnectionCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

export type MongoConnectionSnapshot = {
  readyState: MongoReadyState;
  host?: string;
  name?: string;
};
