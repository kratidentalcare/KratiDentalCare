import "server-only";

import type { Model, Types } from "mongoose";

import type { AppointmentEmailAction } from "@/constants/email";
import type { BaseDocument, LeanBaseDocument } from "@/models/base";

export type AppointmentActionTokenFields = {
  tokenHash: string;
  appointmentId: Types.ObjectId;
  action: AppointmentEmailAction;
  bundleId: string;
  expiresAt: Date;
  consumedAt: Date | null;
  consumedByAction: AppointmentEmailAction | null;
};

export type AppointmentActionTokenDocument = BaseDocument &
  AppointmentActionTokenFields;

export type LeanAppointmentActionToken = LeanBaseDocument &
  AppointmentActionTokenFields;

export type AppointmentActionTokenModel =
  Model<AppointmentActionTokenDocument>;
