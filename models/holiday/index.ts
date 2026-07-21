import "server-only";

import { getOrCreateModel } from "@/models/base";

import { holidaySchema } from "./schema";
import type { HolidayDocument, HolidayModel } from "./types";

export const HOLIDAY_MODEL_NAME = "Holiday";

/**
 * Holiday model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Holiday = getOrCreateModel<HolidayDocument>(
  HOLIDAY_MODEL_NAME,
  holidaySchema,
) as HolidayModel;

export type {
  HolidayDocument,
  HolidayFields,
  HolidayModel,
  LeanHoliday,
} from "./types";
export { holidaySchema, toUtcMidnight } from "./schema";
