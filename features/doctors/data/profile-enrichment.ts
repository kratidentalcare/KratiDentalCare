/**
 * Optional public-profile enrichment keyed by doctor slug.
 * Use until education / expertise exist on the Doctor schema.
 * Safe to leave empty for future doctors — UI shows graceful placeholders.
 */
export type DoctorProfileEnrichment = {
  education?: readonly string[];
  /** Overrides specialties for the Expertise section when provided. */
  expertise?: readonly string[];
};

const DR_GAURAV_ENRICHMENT: DoctorProfileEnrichment = {
  education: [
    "Bachelor of Dental Surgery (BDS)",
    "MDS (Periodontics and Oral Implantology)",
  ],
  expertise: [
    "General Dentistry",
    "Cosmetic Dentistry",
    "Root Canal Treatment",
    "Preventive Oral Care",
    "Family Dental Care",
    "Perio Plastic Surgeries",
    "Certified Invisalign Provider",
  ],
};

export const DOCTOR_PROFILE_ENRICHMENT: Readonly<
  Record<string, DoctorProfileEnrichment>
> = {
  /** Production / marketing slug */
  "dr-gaurav": DR_GAURAV_ENRICHMENT,
  /** Local seed slug (`scripts/seed`) */
  "seed-dr-gaurav": DR_GAURAV_ENRICHMENT,
};
