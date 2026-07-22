import { SCHEDULE_OVERRIDE_TYPES } from "@/constants/scheduling";
import { toUtcMidnight } from "@/models/holiday";
import { ScheduleOverride } from "@/models/schedule-override";

import type { SeedContext } from "../lib/context";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

function utcDate(year: number, month: number, day: number): Date {
  return toUtcMidnight(new Date(Date.UTC(year, month - 1, day)));
}

export async function seedScheduleOverrides(ctx: SeedContext): Promise<void> {
  const year = new Date().getUTCFullYear();

  const overrides = [
    {
      date: utcDate(year, 4, 10),
      type: SCHEDULE_OVERRIDE_TYPES.ALL_DAY,
      startTime: null as string | null,
      endTime: null as string | null,
      reason: "Staff training day (demo seed)",
    },
    {
      date: utcDate(year, 5, 20),
      type: SCHEDULE_OVERRIDE_TYPES.TIME_RANGE,
      startTime: "10:00",
      endTime: "13:00",
      reason: "Morning equipment maintenance (demo seed)",
    },
    {
      date: utcDate(year, 7, 8),
      type: SCHEDULE_OVERRIDE_TYPES.TIME_RANGE,
      startTime: "15:00",
      endTime: "19:00",
      reason: "Afternoon conference block (demo seed)",
    },
    {
      date: utcDate(year, 9, 12),
      type: SCHEDULE_OVERRIDE_TYPES.TIME_RANGE,
      startTime: "12:00",
      endTime: "14:30",
      reason: "Extended lunch / inventory (demo seed)",
    },
  ] as const;

  for (const override of overrides) {
    const filter =
      override.type === SCHEDULE_OVERRIDE_TYPES.ALL_DAY
        ? {
            date: override.date,
            type: SCHEDULE_OVERRIDE_TYPES.ALL_DAY,
            deletedAt: null,
          }
        : {
            date: override.date,
            type: SCHEDULE_OVERRIDE_TYPES.TIME_RANGE,
            startTime: override.startTime,
            endTime: override.endTime,
            deletedAt: null,
          };

    await upsertOne(ScheduleOverride, filter, {
      date: override.date,
      type: override.type,
      startTime: override.startTime,
      endTime: override.endTime,
      reason: override.reason,
      createdBy: ctx.admin._id,
      isActive: true,
    });
  }

  logOk(`Schedule Overrides Seeded (${overrides.length})`);
}
