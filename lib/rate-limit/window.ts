/**
 * Pure rate-limit arithmetic — Mongo persistence lives in consume-rate-limit.
 */
export function isLimitExceeded(count: number, max: number): boolean {
  return count > max;
}

export function windowStartFor(now: Date, windowSec: number): Date {
  const windowMs = windowSec * 1000;
  const epoch = Math.floor(now.getTime() / windowMs) * windowMs;
  return new Date(epoch);
}
