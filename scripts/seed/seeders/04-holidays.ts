import { Holiday, toUtcMidnight } from "@/models/holiday";

import type { SeedContext } from "../lib/context";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

type HolidaySeed = {
  date: Date;
  reason: string;
  isRecurring: boolean;
};

function utcDate(year: number, month: number, day: number): Date {
  return toUtcMidnight(new Date(Date.UTC(year, month - 1, day)));
}

function buildHolidaySeeds(year: number): HolidaySeed[] {
  return [
    {
      date: utcDate(year, 1, 26),
      reason: "Republic Day",
      isRecurring: true,
    },
    {
      date: utcDate(year, 8, 15),
      reason: "Independence Day",
      isRecurring: true,
    },
    {
      date: utcDate(year, 10, 2),
      reason: "Gandhi Jayanti",
      isRecurring: true,
    },
    {
      date: utcDate(year, 11, 1),
      reason: "Diwali — clinic closed",
      isRecurring: false,
    },
    {
      date: utcDate(year, 3, 15),
      reason: "Clinic renovation (demo seed)",
      isRecurring: false,
    },
  ];
}

export async function seedHolidays(ctx: SeedContext): Promise<void> {
  const year = new Date().getUTCFullYear();
  const seeds = buildHolidaySeeds(year);

  for (const seed of seeds) {
    const filter = seed.isRecurring
      ? {
          isRecurring: true,
          month: seed.date.getUTCMonth() + 1,
          day: seed.date.getUTCDate(),
          deletedAt: null,
        }
      : {
          isRecurring: false,
          date: seed.date,
          deletedAt: null,
        };

    await upsertOne(Holiday, filter, {
      date: seed.date,
      month: seed.date.getUTCMonth() + 1,
      day: seed.date.getUTCDate(),
      reason: seed.reason,
      isRecurring: seed.isRecurring,
      createdBy: ctx.admin._id,
      isActive: true,
    });
  }

  logOk(`Holidays Seeded (${seeds.length})`);
}
