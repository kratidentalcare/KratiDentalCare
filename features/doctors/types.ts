import type { Weekday } from "@/constants/doctor";

/**
 * Public-facing doctor profile for the /doctors marketing page.
 * Sourced from the Doctor model; education/certifications may be enriched
 * until those fields land on the schema.
 */
export type PublicDoctorProfile = {
  id: string;
  slug: string;
  fullName: string;
  qualification: string | null;
  yearsOfExperience: number | null;
  specialties: string[];
  bio: string | null;
  languages: string[];
  registrationNumber: string | null;
  profilePhoto: string | null;
  imageAlt: string;
  workingDays: Weekday[];
  startTime: string;
  endTime: string;
  /** Optional enrichment until schema supports education[]. */
  education: string[];
  /** Optional enrichment until schema supports certifications[]. */
  certifications: string[];
  /** Clinical focus areas — defaults to specialties when enrichment is absent. */
  expertise: string[];
};

export type PublicClinicHours = {
  workingDays: Weekday[];
  openingTime: string;
  closingTime: string;
  label: string;
};
