/**
 * Mongoose models entrypoint.
 * Import the connection from `@/lib/db` — never open connections inside model files.
 */

export * from "./base";
export * from "./user";
export * from "./doctor";
export * from "./patient";
export * from "./holiday";
