import type { Model, Types } from "mongoose";

import type { ScheduleOverrideType } from "@/constants/scheduling";
import type {
  LeanSoftActivatableDocument,
  SoftActivatableDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Date-specific clinic closure or partial-time block.
 * Future: optional doctorId / clinicId for multi-resource scheduling.
 *
 * @see docs/04-database-design.md (schedule overrides)
 */
export type ScheduleOverrideFields = {
  /**
   * Calendar day as UTC midnight for that civil date
   * (same convention as Holiday.date).
   */
  date: Date;
  type: ScheduleOverrideType;
  /** Required when type is TIME_RANGE; clinic-local HH:mm. */
  startTime: string | null;
  /** Required when type is TIME_RANGE; clinic-local HH:mm. */
  endTime: string | null;
  reason: string;
  createdBy: Types.ObjectId;
};

export type ScheduleOverrideDocument = SoftActivatableDocument &
  ScheduleOverrideFields;

export type LeanScheduleOverride = LeanSoftActivatableDocument &
  ScheduleOverrideFields;

export type ScheduleOverrideModel = Model<
  ScheduleOverrideDocument,
  SoftDeleteQueryHelpers
>;
