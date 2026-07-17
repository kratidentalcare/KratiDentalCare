import type { Model, Types } from "mongoose";

import type {
  AppointmentEventType,
  NotificationChannel,
  NotificationStatus,
} from "@/constants/appointments";
import type { BaseDocument, LeanBaseDocument } from "@/models/base";

export type NotificationOutboxFields = {
  appointmentId: Types.ObjectId;
  channel: NotificationChannel;
  eventType: AppointmentEventType;
  status: NotificationStatus;
  idempotencyKey: string;
  payload: Record<string, unknown> | null;
  lastError: string | null;
  sentAt: Date | null;
};

export type NotificationOutboxDocument = BaseDocument & NotificationOutboxFields;

export type LeanNotificationOutbox = LeanBaseDocument & NotificationOutboxFields;

export type NotificationOutboxModel = Model<NotificationOutboxDocument>;
