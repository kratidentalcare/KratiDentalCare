/**
 * Patient phone identity helpers.
 * Display phone keeps operator-friendly formatting; canonical phone is the
 * unique booking identity (digits with optional leading +).
 */

/** Digits-only identity, preserving a leading `+` when present. */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) {
    return "";
  }

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  return hasPlus ? `+${digits}` : digits;
}

/** Compact display form used when persisting the human-facing phone field. */
export function toDisplayPhone(phone: string): string {
  return phone.trim().replace(/\s+/g, " ");
}

/** Escape user search input for safe MongoDB regex matching. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Digits extracted from a search term for phone matching.
 * Returns null when the term has no digits (name/email search only).
 */
export function phoneSearchDigits(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 3 ? digits : null;
}
