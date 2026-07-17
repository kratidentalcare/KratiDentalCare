/**
 * Whole-year age at a reference date (defaults to now).
 */
export function calculateAgeYears(
  dateOfBirth: Date | null | undefined,
  at: Date = new Date(),
): number | null {
  if (!(dateOfBirth instanceof Date) || Number.isNaN(dateOfBirth.getTime())) {
    return null;
  }

  let age = at.getFullYear() - dateOfBirth.getFullYear();
  const monthDelta = at.getMonth() - dateOfBirth.getMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && at.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  if (age < 0 || age > 150) {
    return null;
  }

  return age;
}
