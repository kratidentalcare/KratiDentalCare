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
