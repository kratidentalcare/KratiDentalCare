/**
 * Application configuration exports.
 *
 * - `@/config/env` — server-only environment validation
 * - `@/config/auth` — edge-safe auth path matchers (use from `proxy.ts`)
 * - `@/config/clerk-appearance` — shared Clerk UI theming
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

export { clerkAppearance } from "./clerk-appearance";

export { AUTH_CONFIG, isProtectedPath } from "./auth";
