import { Types } from "mongoose";

/**
 * Minute-level occupancy key for atomic doctor slot claims.
 * Format: `{doctorId}:{startMinuteEpoch}`
 */
export function buildOccupancyKey(
  doctorId: string | Types.ObjectId,
  startsAt: Date,
): string {
  const doctor = String(doctorId);
  const minuteEpoch = Math.floor(startsAt.getTime() / 60_000);
  return `${doctor}:${minuteEpoch}`;
}

export function slotsMatchExactly(
  aStart: string,
  aEnd: string,
  bStart: Date,
  bEnd: Date,
): boolean {
  return (
    new Date(aStart).getTime() === bStart.getTime() &&
    new Date(aEnd).getTime() === bEnd.getTime()
  );
}

export function findMatchingGeneratedSlot<
  T extends { startAt: string; endAt: string },
>(slots: readonly T[], startAt: Date, endAt: Date): T | undefined {
  return slots.find((slot) =>
    slotsMatchExactly(slot.startAt, slot.endAt, startAt, endAt),
  );
}
