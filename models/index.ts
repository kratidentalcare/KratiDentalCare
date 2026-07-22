/**
 * Mongoose models entrypoint.
 * Import the connection from `@/lib/db` — never open connections inside model files.
 */

export * from "./base";
export * from "./user";
export * from "./doctor";
export * from "./patient";
export * from "./holiday";
export * from "./clinic-settings";
export * from "./schedule-override";
export * from "./slot";
export * from "./appointment";
export * from "./appointment-event";
export * from "./notification-outbox";
export * from "./prescription";
export * from "./service";
export * from "./testimonial";
export * from "./faq";
export * from "./contact-message";
