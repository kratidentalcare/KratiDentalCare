import type { ConnectOptions } from "mongoose";

/**
 * Connection-layer constants for MongoDB / Mongoose.
 * Field-level DB constants live in `@/constants/db`.
 */

/**
 * Mongoose connection readyState values.
 * @see https://mongoosejs.com/docs/api/connection.html#Connection.prototype.readyState
 */
export const MONGO_READY_STATE = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  CONNECTING: 2,
  DISCONNECTING: 3,
} as const;

export type MongoReadyState =
  (typeof MONGO_READY_STATE)[keyof typeof MONGO_READY_STATE];

/**
 * Default connect options tuned for Next.js App Router / serverless.
 * - `bufferCommands: false` fails fast instead of buffering when disconnected
 * - Bounded pool size avoids exhausting Atlas under concurrent lambdas
 */
export const DEFAULT_MONGO_CONNECT_OPTIONS = {
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 45_000,
} as const satisfies ConnectOptions;
