/**
 * Seeders run in dependency order. Export here when adding a new seeder
 * so `scripts/seed/index.ts` can import from one place.
 */
export { seedAdmin } from "./01-admin";
export { seedDoctor } from "./02-doctor";
export { seedClinicSettings } from "./03-clinic-settings";
export { seedHolidays } from "./04-holidays";
export { seedScheduleOverrides } from "./05-schedule-overrides";
export { seedFaqs } from "./06-faqs";
export { seedPatients } from "./07-patients";
export { seedAppointments } from "./08-appointments";
export { seedPrescriptions } from "./09-prescriptions";
