/**
 * Mongoose models entrypoint.
 * Business models will be added in later phases; foundation lives in `./base`.
 *
 * Import foundation helpers from `@/models/base` (or this barrel).
 * Import the connection from `@/lib/db` — never open connections inside model files.
 */

export * from "./base";
