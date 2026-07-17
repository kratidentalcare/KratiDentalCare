import type { Model, Types } from "mongoose";

import type { AppointmentEventType } from "@/constants/appointments";
import type {
  LeanBaseDocument,
  BaseDocument,
} from "@/models/base";

export type AppointmentEventFields = {
  appointmentId: Types.ObjectId;
  eventType: AppointmentEventType;
  actorUserId: Types.ObjectId | null;
  payload: Record<string, unknown> | null;
};

export type AppointmentEventDocument = BaseDocument & AppointmentEventFields;

export type LeanAppointmentEvent = LeanBaseDocument & AppointmentEventFields;

export type AppointmentEventModel = Model<AppointmentEventDocument>;
