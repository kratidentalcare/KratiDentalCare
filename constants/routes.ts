/**
 * Canonical app URL paths (kebab-case).
 * @see docs/03-system-architecture.md §4.1, §22
 */

export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  /** Authenticated profile placeholder (full profile UI lands later). */
  PROFILE: "/profile",
  /** Public marketing site (single-page section anchors until dedicated routes ship). */
  PUBLIC: {
    HOME: "/",
    SERVICES: "/#services",
    DOCTORS: "/#doctors",
    BOOK: "/#book",
    CONTACT: "/#contact",
  },
  PATIENT: {
    ROOT: "/patient",
  },
  ADMIN: {
    ROOT: "/admin",
  },
  API: {
    CLERK_WEBHOOK: "/api/webhooks/clerk",
  },
} as const;
