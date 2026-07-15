import type { Model, Types } from "mongoose";

import type {
  LeanSoftActivatableDocument,
  SoftActivatableDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Clinic closed-date calendar rule.
 * Consulted by slot generation / booking — not a substitute for SlotStatus.HOLIDAY rows.
 *
 * @see docs/04-database-design.md §F
 */
export type HolidayFields = {
  /**
   * Calendar day as UTC midnight for that civil date.
   * Convention: store the clinic-local date converted to UTC midnight
   * (no time-of-day semantics).
   */
  date: Date;
  /** Month (1–12) denormalized from `date` for recurring lookups. */
  month: number;
  /** Day of month (1–31) denormalized from `date` for recurring lookups. */
  day: number;
  /** Human label, e.g. "Diwali", "Clinic renovation". */
  reason: string;
  /** When true, applies every year on the same month/day. */
  isRecurring: boolean;
  /** Admin (or staff) user who created the rule. */
  createdBy: Types.ObjectId;
};

export type HolidayDocument = SoftActivatableDocument & HolidayFields;

export type LeanHoliday = LeanSoftActivatableDocument & HolidayFields;

export type HolidayModel = Model<HolidayDocument, SoftDeleteQueryHelpers>;
