/**
 * Application configuration exports.
 *
 * - `@/config/env` — server-only environment validation
 * - `@/config/auth` — edge-safe auth path matchers (use from `proxy.ts`)
 */

export {
  getEnv,
  requireClerkEnv,
  requireMongoUri,
  resetEnvCache,
  type ClerkEnv,
  type Env,
  type ServerEnv,
} from "./env";
