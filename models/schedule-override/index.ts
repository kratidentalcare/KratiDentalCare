import "server-only";

import { getOrCreateModel } from "@/models/base";

import {
  SCHEDULE_OVERRIDE_MODEL_NAME,
  scheduleOverrideSchema,
} from "./schema";
import type {
  ScheduleOverrideDocument,
  ScheduleOverrideModel,
} from "./types";

/**
 * ScheduleOverride model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const ScheduleOverride = getOrCreateModel<ScheduleOverrideDocument>(
  SCHEDULE_OVERRIDE_MODEL_NAME,
  scheduleOverrideSchema,
) as ScheduleOverrideModel;

export type {
  LeanScheduleOverride,
  ScheduleOverrideDocument,
  ScheduleOverrideFields,
  ScheduleOverrideModel,
} from "./types";
export {
  SCHEDULE_OVERRIDE_MODEL_NAME,
  scheduleOverrideSchema,
} from "./schema";
