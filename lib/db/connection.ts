import "server-only";

import mongoose from "mongoose";

import { requireMongoUri } from "@/config/env";
import {
  DEFAULT_MONGO_CONNECT_OPTIONS,
  MONGO_READY_STATE,
} from "@/lib/db/constants";
import type {
  MongoConnectionSnapshot,
  MongooseConnectionCache,
} from "@/lib/db/types";
import { logger } from "@/lib/logger";

declare global {
  // eslint-disable-next-line no-var -- required for global mongoose cache
  var mongooseConnection: MongooseConnectionCache | undefined;
}

const cache: MongooseConnectionCache = global.mongooseConnection ?? {
  conn: null,
  promise: null,
};

global.mongooseConnection = cache;

let listenersAttached = false;

function attachConnectionListeners(): void {
  if (listenersAttached) {
    return;
  }

  const { connection } = mongoose;

  connection.on("error", (error: Error) => {
    logger.error("MongoDB connection error", error);
  });

  connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
    // Allow a future connectMongo() call to open a new connection.
    if (cache.conn?.connection.readyState === MONGO_READY_STATE.DISCONNECTED) {
      cache.conn = null;
      cache.promise = null;
    }
  });

  connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });

  listenersAttached = true;
}

function isConnectedInstance(
  instance: typeof mongoose | null,
): instance is typeof mongoose {
  return instance?.connection.readyState === MONGO_READY_STATE.CONNECTED;
}

function resetCacheIfStale(): void {
  const state = cache.conn?.connection.readyState;

  if (
    state === MONGO_READY_STATE.DISCONNECTED ||
    state === MONGO_READY_STATE.DISCONNECTING
  ) {
    cache.conn = null;
    cache.promise = null;
  }
}

/**
 * Connects to MongoDB via Mongoose (singleton, serverless-safe).
 *
 * Safe under Next.js HMR and warm serverless invocations via `globalThis` cache.
 * Does not register business models — call from services/actions in later phases.
 *
 * @see docs/03-system-architecture.md §12
 */
export async function connectMongo(): Promise<typeof mongoose> {
  if (isConnectedInstance(cache.conn)) {
    return cache.conn;
  }

  resetCacheIfStale();

  const uri = requireMongoUri();
  attachConnectionListeners();

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, DEFAULT_MONGO_CONNECT_OPTIONS)
      .then((instance) => {
        logger.info("MongoDB connected", {
          readyState: instance.connection.readyState,
          host: instance.connection.host,
          name: instance.connection.name,
        });
        return instance;
      })
      .catch((error: unknown) => {
        cache.promise = null;
        cache.conn = null;
        logger.error("MongoDB connection failed", error);
        throw error;
      });
  }

  cache.conn = await cache.promise;

  if (!isConnectedInstance(cache.conn)) {
    cache.conn = null;
    cache.promise = null;
    throw new Error(
      "MongoDB connection finished without reaching connected readyState.",
    );
  }

  return cache.conn;
}

/**
 * Architecture alias for `connectMongo`.
 * Prefer this name at call sites documented as `lib/db.connect()`.
 */
export const connect = connectMongo;

/**
 * Returns true when mongoose reports a connected readyState.
 */
export function isMongoConnected(): boolean {
  return isConnectedInstance(cache.conn);
}

/**
 * Lightweight snapshot for health checks / diagnostics (no secrets).
 */
export function getMongoConnectionSnapshot(): MongoConnectionSnapshot {
  const connection = cache.conn?.connection;

  return {
    readyState:
      (connection?.readyState as MongoConnectionSnapshot["readyState"]) ??
      MONGO_READY_STATE.DISCONNECTED,
    host: connection?.host,
    name: connection?.name,
  };
}

/**
 * Disconnect helper for tests / scripts. Not used on the request path.
 */
export async function disconnectMongo(): Promise<void> {
  if (!cache.conn && !cache.promise) {
    return;
  }

  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
  logger.info("MongoDB disconnected");
}

/**
 * Resets the in-memory connection cache — intended for tests only.
 * Does not call `mongoose.disconnect()` by itself.
 */
export function resetMongoConnectionCache(): void {
  cache.conn = null;
  cache.promise = null;
}
