import type { TimeInterval } from "@/features/scheduling/types";

/**
 * Pure interval helpers for the availability engine.
 * All intervals are half-open: `[startMs, endMs)`.
 */

export function overlaps(a: TimeInterval, b: TimeInterval): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs;
}

export function containsFully(
  container: TimeInterval,
  inner: TimeInterval,
): boolean {
  return (
    inner.startMs >= container.startMs && inner.endMs <= container.endMs
  );
}

/**
 * True when `candidate` overlaps any blocker.
 */
export function isBlockedByAny(
  candidate: TimeInterval,
  blockers: readonly TimeInterval[],
): boolean {
  return blockers.some((blocker) => overlaps(candidate, blocker));
}

/**
 * Build consecutive `[start, start+duration)` candidates that fit fully
 * inside the working window.
 */
export function buildCandidateIntervals(
  window: TimeInterval,
  durationMinutes: number,
): TimeInterval[] {
  const durationMs = durationMinutes * 60_000;
  if (durationMs <= 0) {
    return [];
  }

  const slots: TimeInterval[] = [];
  let cursor = window.startMs;

  while (cursor + durationMs <= window.endMs) {
    slots.push({ startMs: cursor, endMs: cursor + durationMs });
    cursor += durationMs;
  }

  return slots;
}

export function toInterval(
  start: Date | string | number,
  end: Date | string | number,
): TimeInterval {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    throw new Error("Invalid interval bounds");
  }
  return { startMs, endMs };
}
