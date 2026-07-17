import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { USER_MODEL_NAME } from "@/models/user/constants";

const REASON_MAX = 200;

/**
 * Normalize any Date to UTC midnight of its UTC calendar day.
 * Holidays are date-only; time-of-day must not affect uniqueness or matching.
 */
export function toUtcMidnight(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

function daysInUtcMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Holiday calendar schema.
 * Collection: `holidays`
 */
export const holidaySchema = createBaseSchema(
  {
    date: {
      type: Date,
      required: [true, "date is required"],
      set: (value: Date) => toUtcMidnight(new Date(value)),
    },
    month: {
      type: Number,
      required: true,
      min: [1, "month must be between 1 and 12"],
      max: [12, "month must be between 1 and 12"],
    },
    day: {
      type: Number,
      required: true,
      min: [1, "day must be between 1 and 31"],
      max: [31, "day must be between 1 and 31"],
    },
    reason: {
      type: String,
      required: [true, "reason is required"],
      trim: true,
      maxlength: [REASON_MAX, "reason is too long"],
    },
    isRecurring: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: [true, "createdBy is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: true,
    collection: "holidays",
  },
);

holidaySchema.pre("validate", function syncMonthDayFromDate() {
  const rawDate = this.get("date") as Date | undefined;

  if (!(rawDate instanceof Date) || Number.isNaN(rawDate.getTime())) {
    return;
  }

  const normalized = toUtcMidnight(rawDate);
  this.set("date", normalized);

  const month = normalized.getUTCMonth() + 1;
  const day = normalized.getUTCDate();
  const year = normalized.getUTCFullYear();

  if (day > daysInUtcMonth(year, month - 1)) {
    this.invalidate("date", "date is not a valid calendar day");
    return;
  }

  this.set("month", month);
  this.set("day", day);
});

// One-off clinic closures: one document per calendar date.
holidaySchema.index(
  { date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isRecurring: false,
      deletedAt: null,
    },
  },
);

// Annual closures: one rule per month/day (e.g. Independence Day).
holidaySchema.index(
  { month: 1, day: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isRecurring: true,
      deletedAt: null,
    },
  },
);

holidaySchema.index({ isRecurring: 1, isActive: 1 });
holidaySchema.index({ date: 1, isActive: 1 });
holidaySchema.index({ createdBy: 1, createdAt: -1 });
