const SIMPLE_EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const NAMED_EMAIL = /^.+\s<[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>$/;

/**
 * Strips wrapping quotes Next/dotenv sometimes leave on EMAIL_FROM
 * and accepts `email@domain` or `Name <email@domain>`.
 */
export function normalizeEmailFrom(
  raw: string | null | undefined,
): string | null {
  if (!raw) {
    return null;
  }

  let value = raw.trim();
  while (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    value = value.slice(1, -1).trim();
  }

  if (!value) {
    return null;
  }

  if (SIMPLE_EMAIL.test(value) || NAMED_EMAIL.test(value)) {
    return value;
  }

  return null;
}
