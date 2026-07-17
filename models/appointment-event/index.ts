import "server-only";

import { getOrCreateModel } from "@/models/base";

import { appointmentEventSchema, APPOINTMENT_EVENT_MODEL_NAME } from "./schema";
import type { AppointmentEventDocument, AppointmentEventModel } from "./types";

export const AppointmentEvent = getOrCreateModel<AppointmentEventDocument>(
  APPOINTMENT_EVENT_MODEL_NAME,
  appointmentEventSchema,
) as AppointmentEventModel;

export type {
  AppointmentEventDocument,
  AppointmentEventFields,
  AppointmentEventModel,
  LeanAppointmentEvent,
} from "./types";
export { appointmentEventSchema, APPOINTMENT_EVENT_MODEL_NAME } from "./schema";
