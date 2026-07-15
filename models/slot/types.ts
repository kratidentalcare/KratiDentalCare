import type { Model, Types } from "mongoose";

import type { SlotStatus } from "@/constants/statuses";
import type {
  LeanSoftDeleteDocument,
  SoftDeleteDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Bookable inventory window for a doctor.
 * Appointment lifecycle is richer and lives on `appointments` (1:1 when booked).
 *
 * @see docs/database-architecture.md §3.4
 * @see docs/04-database-design.md §C.3
 */
export type SlotFields = {
  doctorId: Types.ObjectId;
  startAt: Date;
  endAt: Date;
  status: SlotStatus;
  /** Set when status is BOOKED; null otherwise. */
  appointmentId: Types.ObjectId | null;
  createdByUserId: Types.ObjectId;
  notes: string | null;
};

export type SlotDocument = SoftDeleteDocument & SlotFields;

export type LeanSlot = LeanSoftDeleteDocument & SlotFields;

export type SlotModel = Model<SlotDocument, SoftDeleteQueryHelpers>;
