/**
 * Mongoose models entrypoint.
 * Import the connection from `@/lib/db` — never open connections inside model files.
 */

export * from "./base";
export * from "./user";
export * from "./doctor";
export * from "./patient";
export * from "./holiday";
export * from "./slot";
export * from "./appointment";
export * from "./prescription";
export * from "./service";
export * from "./testimonial";
