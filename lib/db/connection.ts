import "server-only";

import mongoose from "mongoose";

import { requireMongoUri } from "@/config/env";
import { logger } from "@/lib/logger";

/**
 * Cached connection across hot-reload / serverless invocations.
 * @see docs/03-system-architecture.md §12
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var -- required for global mongoose cache
  var mongooseConnection: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseConnection ?? {
  conn: null,
  promise: null,
};

global.mongooseConnection = cache;

/**
 * Connects to MongoDB via Mongoose (singleton).
 * Does not register models — call from services/actions in later phases.
 */
export async function connectMongo(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  const uri = requireMongoUri();

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((instance) => {
        logger.info("MongoDB connected", {
          readyState: instance.connection.readyState,
        });
        return instance;
      })
      .catch((error: unknown) => {
        cache.promise = null;
        logger.error("MongoDB connection failed", error);
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

/**
 * Returns true when mongoose reports a connected readyState (1).
 */
export function isMongoConnected(): boolean {
  return cache.conn?.connection.readyState === 1;
}

/**
 * Disconnect helper for tests / scripts. Not used in request path.
 */
export async function disconnectMongo(): Promise<void> {
  if (cache.conn) {
    await cache.conn.disconnect();
    cache.conn = null;
    cache.promise = null;
    logger.info("MongoDB disconnected");
  }
}
