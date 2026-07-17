import "server-only";

import { Types } from "mongoose";

import { SCHEDULE_OVERRIDE_TYPES } from "@/constants/scheduling";
import {
  civilDateToUtcMidnight,
  utcMidnightToCivilDate,
} from "@/features/scheduling/lib/timezone";
import type { OverrideListItem } from "@/features/scheduling/types";
import { connect } from "@/lib/db";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  ScheduleOverride,
  type LeanScheduleOverride,
} from "@/models/schedule-override";
import {
  createScheduleOverrideActionSchema,
  type CreateScheduleOverrideActionInput,
} from "@/validators/schedule-override";

function toOverrideListItem(doc: LeanScheduleOverride): OverrideListItem {
  return {
    id: String(doc._id),
    date: utcMidnightToCivilDate(new Date(doc.date)),
    type: doc.type,
    startTime: doc.startTime,
    endTime: doc.endTime,
    reason: doc.reason,
    isActive: doc.isActive,
  };
}

export async function listScheduleOverrides(): Promise<OverrideListItem[]> {
  await connect();
  const rows = await ScheduleOverride.find({})
    .sort({ date: 1, startTime: 1 })
    .lean<LeanScheduleOverride[]>();
  return rows.map(toOverrideListItem);
}

export async function listOverridesForCivilDate(
  date: string,
): Promise<LeanScheduleOverride[]> {
  await connect();
  const utcDate = civilDateToUtcMidnight(date);
  return ScheduleOverride.find({
    date: utcDate,
    isActive: true,
  }).lean<LeanScheduleOverride[]>();
}

export async function createScheduleOverride(
  input: CreateScheduleOverrideActionInput,
  createdBy: string,
): Promise<OverrideListItem> {
  await connect();

  const parsed = createScheduleOverrideActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid schedule override",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  const date = civilDateToUtcMidnight(parsed.data.date);
  const isAllDay = parsed.data.type === SCHEDULE_OVERRIDE_TYPES.ALL_DAY;

  // Soft uniqueness for overlapping TIME_RANGE on same day.
  if (!isAllDay && parsed.data.startTime && parsed.data.endTime) {
    const existing = await ScheduleOverride.find({
      date,
      type: SCHEDULE_OVERRIDE_TYPES.TIME_RANGE,
      isActive: true,
    }).lean<LeanScheduleOverride[]>();

    const start = parsed.data.startTime;
    const end = parsed.data.endTime;
    const overlaps = existing.some((row) => {
      if (!row.startTime || !row.endTime) return false;
      return start < row.endTime && row.startTime < end;
    });

    if (overlaps) {
      throw new ConflictError(
        "This time range overlaps an existing block on that date",
      );
    }
  }

  try {
    const created = await ScheduleOverride.create({
      date,
      type: parsed.data.type,
      startTime: isAllDay ? null : parsed.data.startTime,
      endTime: isAllDay ? null : parsed.data.endTime,
      reason: parsed.data.reason,
      createdBy: new Types.ObjectId(createdBy),
      isActive: parsed.data.isActive ?? true,
    });
    return toOverrideListItem(created.toObject() as LeanScheduleOverride);
  } catch (error) {
    if (
      typeof error === "object" &&
      error != null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ConflictError("This date is already blocked for the entire day");
    }
    throw error;
  }
}

export async function deleteScheduleOverride(id: string): Promise<void> {
  await connect();

  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid override id");
  }

  const doc = await ScheduleOverride.findById(id);
  if (!doc) {
    throw new NotFoundError("Schedule override not found");
  }

  await doc.softDelete();
}
