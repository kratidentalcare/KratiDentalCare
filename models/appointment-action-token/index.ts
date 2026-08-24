import "server-only";

import { getOrCreateModel } from "@/models/base";

import {
  appointmentActionTokenSchema,
  APPOINTMENT_ACTION_TOKEN_MODEL_NAME,
} from "./schema";
import type {
  AppointmentActionTokenDocument,
  AppointmentActionTokenModel,
} from "./types";

export const AppointmentActionToken =
  getOrCreateModel<AppointmentActionTokenDocument>(
    APPOINTMENT_ACTION_TOKEN_MODEL_NAME,
    appointmentActionTokenSchema,
  ) as AppointmentActionTokenModel;

export type {
  AppointmentActionTokenDocument,
  AppointmentActionTokenFields,
  AppointmentActionTokenModel,
  LeanAppointmentActionToken,
} from "./types";
export {
  appointmentActionTokenSchema,
  APPOINTMENT_ACTION_TOKEN_MODEL_NAME,
} from "./schema";
