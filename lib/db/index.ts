/**
 * Database infrastructure (connection only — no business models).
 *
 * @example
 * ```ts
 * import { connect } from "@/lib/db";
 * await connect();
 * ```
 */

export {
  DEFAULT_MONGO_CONNECT_OPTIONS,
  MONGO_READY_STATE,
  type MongoReadyState,
} from "./constants";

export {
  connect,
  connectMongo,
  disconnectMongo,
  getMongoConnectionSnapshot,
  isMongoConnected,
  resetMongoConnectionCache,
} from "./connection";

export type {
  MongoConnectionSnapshot,
  MongooseConnectionCache,
} from "./types";
