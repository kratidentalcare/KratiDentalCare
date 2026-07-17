import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  SCHEDULE_OVERRIDE_TYPES,
  SCHEDULE_OVERRIDE_TYPE_VALUES,
  TIME_OF_DAY_PATTERN,
} from "@/constants/scheduling";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { toUtcMidnight } from "@/models/holiday/schema";
import { USER_MODEL_NAME } from "@/models/user/constants";

export const SCHEDULE_OVERRIDE_MODEL_NAME = "ScheduleOverride";

const REASON_MAX = 200;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Schedule override schema — full-day or partial-time blocks.
 * Collection: `schedule_overrides`
 */
export const scheduleOverrideSchema = createBaseSchema(
  {
    date: {
      type: Date,
      required: [true, "date is required"],
      set: (value: Date) => toUtcMidnight(new Date(value)),
    },
    type: {
      type: String,
      required: [true, "type is required"],
      enum: {
        values: [...SCHEDULE_OVERRIDE_TYPE_VALUES],
        message: "`{VALUE}` is not a supported schedule override type",
      },
    },
    startTime: {
      type: String,
      default: null,
      trim: true,
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          if (value == null) {
            return true;
          }
          return TIME_OF_DAY_PATTERN.test(value);
        },
        message: "startTime must be HH:mm (24h)",
      },
    },
    endTime: {
      type: String,
      default: null,
      trim: true,
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          if (value == null) {
            return true;
          }
          return TIME_OF_DAY_PATTERN.test(value);
        },
        message: "endTime must be HH:mm (24h)",
      },
    },
    reason: {
      type: String,
      required: [true, "reason is required"],
      trim: true,
      maxlength: [REASON_MAX, "reason is too long"],
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
    collection: "schedule_overrides",
  },
);

scheduleOverrideSchema.pre("validate", function validateOverrideWindow() {
  const rawDate = this.get("date") as Date | undefined;
  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    this.set("date", toUtcMidnight(rawDate));
  }

  const type = this.get("type") as string | undefined;
  const startTime = this.get("startTime") as string | null | undefined;
  const endTime = this.get("endTime") as string | null | undefined;

  if (type === SCHEDULE_OVERRIDE_TYPES.ALL_DAY) {
    if (startTime != null || endTime != null) {
      this.invalidate(
        "startTime",
        "startTime and endTime must be null for ALL_DAY overrides",
      );
    }
  }

  if (type === SCHEDULE_OVERRIDE_TYPES.TIME_RANGE) {
    if (startTime == null || endTime == null) {
      this.invalidate(
        "startTime",
        "startTime and endTime are required for TIME_RANGE overrides",
      );
    } else if (
      TIME_OF_DAY_PATTERN.test(startTime) &&
      TIME_OF_DAY_PATTERN.test(endTime) &&
      timeToMinutes(endTime) <= timeToMinutes(startTime)
    ) {
      this.invalidate("endTime", "endTime must be after startTime");
    }
  }

});

// One full-day block per civil date (clinic-wide v1).
scheduleOverrideSchema.index(
  { date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: SCHEDULE_OVERRIDE_TYPES.ALL_DAY,
      deletedAt: null,
    },
  },
);

scheduleOverrideSchema.index({ date: 1, type: 1, isActive: 1 });
scheduleOverrideSchema.index({ date: 1, startTime: 1, endTime: 1 });
scheduleOverrideSchema.index({ createdBy: 1, createdAt: -1 });
