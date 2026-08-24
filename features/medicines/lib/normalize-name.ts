/**
 * Normalize a medicine name for duplicate detection.
 * Collapses whitespace and strips spaces before common dose units so
 * "Amoxicillin 500 mg" and "amoxicillin 500mg" match.
 */
export function normalizeMedicineName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(\d)\s+(mg|mcg|µg|ug|g|ml|iu)\b/gi, "$1$2");
}
