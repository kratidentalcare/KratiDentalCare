/**
 * Optional public-profile enrichment keyed by doctor slug.
 * Use until education / expertise exist on the Doctor schema.
 * Safe to leave empty for future doctors — UI shows graceful placeholders.
 */
export type DoctorProfileEnrichment = {
  education?: readonly string[];
  /** Overrides headline specialty badges when provided. */
  specialties?: readonly string[];
  /** Overrides specialties for the Expertise section when provided. */
  expertise?: readonly string[];
  yearsOfExperience?: number;
};

const DR_GAURAV_SPECIALTIES = [
  "Full Mouth Rehabilitation (FMR)",
  "Dental Implants",
  "Single sitting Root Canal",
  "Perio Surgeries",
] as const;

const DR_GAURAV_ENRICHMENT: DoctorProfileEnrichment = {
  yearsOfExperience: 16,
  specialties: DR_GAURAV_SPECIALTIES,
  education: [
    "Bachelor of Dental Surgery (BDS)",
    "MDS (Periodontics and Oral Implantology)",
  ],
  expertise: [
    ...DR_GAURAV_SPECIALTIES,
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
