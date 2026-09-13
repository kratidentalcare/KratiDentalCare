/**
 * Shared email identity helper for patient matching.
 * Trim + lowercase only — no provider-specific transformations.
 */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (email == null) {
    return null;
  }
  const trimmed = email.trim().toLowerCase();
  return trimmed === "" ? null : trimmed;
}
