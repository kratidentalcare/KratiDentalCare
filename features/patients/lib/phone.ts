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

function isIndianMobileTenDigits(digits: string): boolean {
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

/**
 * Last 10 digits of an Indian mobile when the input is a 10-digit number,
 * `0` + 10 digits, or `91` + 10 digits. Otherwise null.
 */
export function indianMobileDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  if (isIndianMobileTenDigits(digits)) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith("0") && isIndianMobileTenDigits(digits.slice(1))) {
    return digits.slice(1);
  }
  if (digits.length === 12 && digits.startsWith("91") && isIndianMobileTenDigits(digits.slice(2))) {
    return digits.slice(2);
  }

  return null;
}

/**
 * Preferred stored identity for new patient writes.
 * Indian mobiles become `+91XXXXXXXXXX`; other numbers use `normalizePhone`.
 */
export function toCanonicalPhone(phone: string): string {
  const mobile = indianMobileDigits(phone);
  if (mobile) {
    return `+91${mobile}`;
  }
  return normalizePhone(phone);
}

/**
 * Equivalent lookup keys for the same phone identity (Indian mobile variants).
 */
export function phoneIdentityKeys(phone: string): string[] {
  const keys = new Set<string>();
  const display = toDisplayPhone(phone);
  const compact = phone.replace(/\s+/g, "").trim();
  const normalized = normalizePhone(phone);
  const canonical = toCanonicalPhone(phone);

  if (display) keys.add(display);
  if (compact) keys.add(compact);
  if (normalized) keys.add(normalized);
  if (canonical) keys.add(canonical);

  const mobile = indianMobileDigits(phone);
  if (mobile) {
    keys.add(mobile);
    keys.add(`91${mobile}`);
    keys.add(`+91${mobile}`);
    keys.add(`0${mobile}`);
  }

  return [...keys];
}

/** True when two phone strings resolve to the same booking identity. */
export function phonesShareIdentity(a: string, b: string): boolean {
  const left = new Set(phoneIdentityKeys(a));
  if (left.size === 0) {
    return false;
  }
  return phoneIdentityKeys(b).some((key) => left.has(key));
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
