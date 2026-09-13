/**
 * Mongo duplicate-key (E11000) helpers for booking writes.
 */

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export function duplicateKeyPath(error: unknown): string | null {
  if (
    error === null ||
    typeof error !== "object" ||
    !("keyPattern" in error) ||
    !error.keyPattern ||
    typeof error.keyPattern !== "object"
  ) {
    return null;
  }

  const keys = Object.keys(error.keyPattern as Record<string, unknown>);
  return keys[0] ?? null;
}

export type BookingDuplicateKind =
  | "idempotency"
  | "slot"
  | "active-patient"
  | "unknown";

/**
 * Classifies a booking insert/update E11000 by the unique index that fired.
 */
export function classifyBookingDuplicateKey(
  error: unknown,
): BookingDuplicateKind {
  if (!isDuplicateKeyError(error)) {
    return "unknown";
  }

  const path = duplicateKeyPath(error);
  if (path === "bookingReference") {
    return "idempotency";
  }
  if (path === "occupancyKey") {
    return "slot";
  }
  if (path === "activePatientHold") {
    return "active-patient";
  }

  const message =
    error instanceof Error ? error.message : String(error ?? "");
  if (message.includes("bookingReference")) {
    return "idempotency";
  }
  if (message.includes("occupancyKey")) {
    return "slot";
  }
  if (message.includes("activePatientHold")) {
    return "active-patient";
  }

  return "unknown";
}
