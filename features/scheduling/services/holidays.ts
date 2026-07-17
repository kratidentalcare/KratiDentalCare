import "server-only";

import { Types } from "mongoose";

import { connect } from "@/lib/db";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { Holiday, type LeanHoliday, toUtcMidnight } from "@/models/holiday";
import {
  civilDateToUtcMidnight,
  parseCivilDate,
  utcMidnightToCivilDate,
} from "@/features/scheduling/lib/timezone";
import type { HolidayListItem } from "@/features/scheduling/types";
import {
  createHolidayActionSchema,
  updateHolidayActionSchema,
  type CreateHolidayActionInput,
  type UpdateHolidayActionInput,
} from "@/validators/holiday";

function toHolidayListItem(doc: LeanHoliday): HolidayListItem {
  return {
    id: String(doc._id),
    date: utcMidnightToCivilDate(new Date(doc.date)),
    reason: doc.reason,
    isRecurring: doc.isRecurring,
    isActive: doc.isActive,
  };
}

export async function listHolidays(): Promise<HolidayListItem[]> {
  await connect();
  const rows = await Holiday.find({})
    .sort({ date: 1, isRecurring: -1 })
    .lean<LeanHoliday[]>();
  return rows.map(toHolidayListItem);
}

/**
 * Find an active holiday matching a civil date (one-off or recurring).
 */
export async function findHolidayForCivilDate(
  date: string,
): Promise<LeanHoliday | null> {
  await connect();
  const { month, day } = parseCivilDate(date);
  const utcDate = civilDateToUtcMidnight(date);

  const oneOff = await Holiday.findOne({
    date: utcDate,
    isRecurring: false,
    isActive: true,
  }).lean<LeanHoliday>();

  if (oneOff) {
    return oneOff;
  }

  return Holiday.findOne({
    month,
    day,
    isRecurring: true,
    isActive: true,
  }).lean<LeanHoliday>();
}

export async function createHoliday(
  input: CreateHolidayActionInput,
  createdBy: string,
): Promise<HolidayListItem> {
  await connect();

  const parsed = createHolidayActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid holiday",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  const date = toUtcMidnight(civilDateToUtcMidnight(parsed.data.date));

  try {
    const created = await Holiday.create({
      date,
      reason: parsed.data.reason,
      isRecurring: parsed.data.isRecurring,
      createdBy: new Types.ObjectId(createdBy),
      isActive: parsed.data.isActive ?? true,
    });
    return toHolidayListItem(created.toObject() as LeanHoliday);
  } catch (error) {
    if (
      typeof error === "object" &&
      error != null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ConflictError("A holiday already exists for this date");
    }
    throw error;
  }
}

export async function updateHoliday(
  id: string,
  input: UpdateHolidayActionInput,
): Promise<HolidayListItem> {
  await connect();

  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid holiday id");
  }

  const parsed = updateHolidayActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid holiday update",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  const $set: Record<string, unknown> = {};
  if (parsed.data.reason !== undefined) {
    $set.reason = parsed.data.reason;
  }
  if (parsed.data.isRecurring !== undefined) {
    $set.isRecurring = parsed.data.isRecurring;
  }
  if (parsed.data.isActive !== undefined) {
    $set.isActive = parsed.data.isActive;
  }
  if (parsed.data.date !== undefined) {
    $set.date = toUtcMidnight(civilDateToUtcMidnight(parsed.data.date));
  }

  try {
    const updated = await Holiday.findByIdAndUpdate(
      id,
      { $set },
      { new: true, runValidators: true },
    ).lean<LeanHoliday>();

    if (!updated) {
      throw new NotFoundError("Holiday not found");
    }

    return toHolidayListItem(updated);
  } catch (error) {
    if (
      typeof error === "object" &&
      error != null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ConflictError("A holiday already exists for this date");
    }
    throw error;
  }
}

export async function deleteHoliday(id: string): Promise<void> {
  await connect();

  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid holiday id");
  }

  const doc = await Holiday.findById(id);
  if (!doc) {
    throw new NotFoundError("Holiday not found");
  }

  await doc.softDelete();
}
