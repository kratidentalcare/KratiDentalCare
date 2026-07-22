/** Stable identifiers and counts for demo seed data (Phase 20.1). */

export const SEED_COUNTS = {
  patients: 25,
  appointments: 60,
  faqs: 15,
  /** Target completed appointments (each gets one prescription). */
  completedAppointments: 40,
  pendingAppointments: 8,
  confirmedAppointments: 7,
  cancelledAppointments: 5,
} as const;

export const SEED_IDS = {
  adminClerkId: "seed_admin_kratidental",
  doctorClerkId: "seed_doctor_kratidental",
  adminEmail: "admin@demo.kratidentalcare.local",
  doctorEmail: "doctor@demo.kratidentalcare.local",
  doctorSlug: "seed-dr-gaurav",
  doctorRegistration: "SEED-DCI-GAURAV-001",
  faqCategory: "demo-seed",
  patientEmailDomain: "demo.kratidentalcare.local",
  /** Indian mobile range reserved for demo patients: +919900000001 … */
  patientPhoneBase: 9_900_000_001,
  appointmentBookingPrefix: "SEED-APT-",
  prescriptionNumberPrefix: "SEED-RX-",
} as const;

export const SEED_APPOINTMENT_REASONS = [
  "Routine dental checkup",
  "Tooth pain evaluation",
  "Teeth cleaning / scaling",
  "Root canal follow-up",
  "Wisdom tooth consultation",
  "Cavity filling",
  "Gum bleeding concern",
  "Teeth whitening consult",
  "Crown / bridge review",
  "Pediatric dental visit",
] as const;
