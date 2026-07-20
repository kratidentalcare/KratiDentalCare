/**
 * Approximate DOB from whole-year age so prescription age stays consistent.
 * Uses the civil anniversary of `at` so `calculateAgeYears` returns `ageYears`.
 */
export function dateOfBirthFromAgeYears(
  ageYears: number,
  at: Date = new Date(),
): Date {
  if (!Number.isInteger(ageYears) || ageYears < 0 || ageYears > 150) {
    throw new RangeError("ageYears must be an integer between 0 and 150");
  }

  return new Date(
    at.getFullYear() - ageYears,
    at.getMonth(),
    at.getDate(),
    12,
    0,
    0,
    0,
  );
}
