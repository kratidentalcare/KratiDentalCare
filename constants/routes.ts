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
  /**
   * Auth infrastructure status pages (access denied, disabled account, …).
   * Not a dashboard surface.
   */
  AUTH: {
    STATUS: "/auth/status",
  },
  /** Public marketing site (single-page section anchors until dedicated routes ship). */
  PUBLIC: {
    HOME: "/",
    SERVICES: "/#services",
    DOCTORS: "/#doctors",
    BOOK: "/book-appointment",
    CONTACT: "/#contact",
  },
  PATIENT: {
    ROOT: "/patient",
  },
  /**
   * Admin dashboard (Phase 13+). Nested module paths are reserved for
   * future business modules — the shell already highlights them when active.
   */
  DASHBOARD: {
    ROOT: "/dashboard",
    APPOINTMENTS: "/dashboard/appointments",
    /** @deprecated Prefer SCHEDULING — reserved legacy path. */
    SLOTS: "/dashboard/slots",
    SCHEDULING: "/dashboard/scheduling",
    PATIENTS: "/dashboard/patients",
    PRESCRIPTIONS: "/dashboard/prescriptions",
    FAQS: "/dashboard/faqs",
    SETTINGS: "/dashboard/settings",
    /** @deprecated Prefer ROUTES.PROFILE — kept for older links. */
    PROFILE: "/profile",
  },
  API: {
    CLERK_WEBHOOK: "/api/webhooks/clerk",
    AVAILABILITY: "/api/availability",
    APPOINTMENTS: "/api/appointments",
    /** Alias of AVAILABILITY — public booking slot lookup. */
    APPOINTMENTS_AVAILABILITY: "/api/availability",
    DASHBOARD_APPOINTMENTS: "/api/dashboard/appointments",
    DASHBOARD_PATIENTS: "/api/dashboard/patients",
    DASHBOARD_PRESCRIPTIONS: "/api/dashboard/prescriptions",
  },
  PUBLIC_BOOK: "/book-appointment",
  /** Legacy admin scaffold (`/admin`) — prefer `DASHBOARD` for new work. */
  ADMIN: {
    ROOT: "/admin",
  },
} as const;
