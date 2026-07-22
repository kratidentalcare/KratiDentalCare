import { ConfigurationError } from "@/lib/errors";

const LOCAL_HOST_MARKERS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
] as const;

/**
 * Parse host + database from a MongoDB URI without relying on `URL`,
 * which breaks when passwords contain reserved characters.
 */
function parseMongoTarget(uri: string): { host: string; dbName: string } {
  const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//i, "");
  const atIndex = withoutProtocol.lastIndexOf("@");
  const hostAndPath =
    atIndex >= 0 ? withoutProtocol.slice(atIndex + 1) : withoutProtocol;

  const slashIndex = hostAndPath.indexOf("/");
  const hostPort =
    slashIndex >= 0 ? hostAndPath.slice(0, slashIndex) : hostAndPath;
  const pathAndQuery =
    slashIndex >= 0 ? hostAndPath.slice(slashIndex + 1) : "";

  const host = hostPort.split(":")[0]?.split("?")[0]?.toLowerCase() ?? "";
  const dbName = pathAndQuery.split("?")[0]?.toLowerCase() ?? "";

  return { host, dbName };
}

function looksLikeDevDatabase(host: string, dbName: string): boolean {
  // Local Mongo is always treated as a safe reset target.
  if (LOCAL_HOST_MARKERS.some((marker) => host.includes(marker))) {
    return true;
  }

  // Remote hosts must use an explicitly non-production database name.
  // Bare "test" (Mongoose default on Atlas) is NOT enough — require
  // ALLOW_DEMO_SEED_RESET=true for those environments.
  const remoteSafeMarkers = ["dev", "demo", "local", "staging"] as const;
  if (
    dbName &&
    remoteSafeMarkers.some((marker) => dbName.includes(marker))
  ) {
    return true;
  }

  return false;
}

/**
 * Guard for any seed operation. Blocks production NODE_ENV unless an
 * explicit local override is set (still never when NODE_ENV=production).
 */
export function assertSeedEnvironmentAllowed(): void {
  const nodeEnv = process.env.NODE_ENV ?? "development";

  if (nodeEnv === "production") {
    throw new ConfigurationError(
      "Refusing to seed: NODE_ENV=production. Demo seeding is development-only.",
    );
  }

  const allowLocal =
    process.env.ALLOW_DEMO_SEED === "true" ||
    nodeEnv === "development" ||
    nodeEnv === "test";

  if (!allowLocal) {
    throw new ConfigurationError(
      `Refusing to seed: NODE_ENV="${nodeEnv}". Use development or set ALLOW_DEMO_SEED=true.`,
    );
  }
}

/**
 * Extra guard for destructive reset. Never runs in production and requires
 * a local/dev Mongo target (or an explicit confirm flag).
 *
 * `connectedDbName` is preferred when the URI omits a database path
 * (Mongoose may default to `test`).
 */
export function assertDemoResetAllowed(
  mongoUri: string,
  connectedDbName?: string,
): void {
  assertSeedEnvironmentAllowed();

  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv !== "development" && nodeEnv !== "test") {
    throw new ConfigurationError(
      "Refusing seed:reset: NODE_ENV must be development (or test).",
    );
  }

  const explicitConfirm = process.env.ALLOW_DEMO_SEED_RESET === "true";
  if (explicitConfirm) {
    return;
  }

  const { host, dbName: uriDbName } = parseMongoTarget(mongoUri);
  const dbName = (connectedDbName || uriDbName).toLowerCase();

  if (looksLikeDevDatabase(host, dbName)) {
    return;
  }

  throw new ConfigurationError(
    "Refusing seed:reset: MongoDB target does not look like a local/dev database. " +
      "Set ALLOW_DEMO_SEED_RESET=true only if you are certain this is a demo database.",
  );
}
