import "server-only";

import { getOrCreateModel } from "@/models/base";
import { APPOINTMENT_MODEL_NAME } from "@/models/slot";

import { appointmentSchema } from "./schema";
import type { AppointmentDocument, AppointmentModel } from "./types";

/**
 * Appointment model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Appointment = getOrCreateModel<AppointmentDocument>(
  APPOINTMENT_MODEL_NAME,
  appointmentSchema,
) as AppointmentModel;

export type {
  AppointmentDoctorSnapshot,
  AppointmentDocument,
  AppointmentFields,
  AppointmentModel,
  AppointmentPatientSnapshot,
  LeanAppointment,
} from "./types";
export { appointmentSchema } from "./schema";
export { APPOINTMENT_MODEL_NAME };
