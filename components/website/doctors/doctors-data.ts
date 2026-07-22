import type { LucideIcon } from "lucide-react";
import { Activity, Sparkles, SmilePlus } from "lucide-react";

/**
 * Homepage / clinic doctor profiles.
 * Kept serializable-friendly for a future MongoDB/CMS migration.
 */
export type DoctorSpecialtyIcon = "tooth" | "sparkles" | "activity";

export interface DoctorSpecialty {
  id: string;
  label: string;
  icon: DoctorSpecialtyIcon;
}

export interface Doctor {
  id: string;
  slug: string;
  name: string;
  designation: string;
  experienceYears: string;
  experienceLabel: string;
  specializations: readonly DoctorSpecialty[];
  imageSrc: string;
  imageAlt: string;
}

export const SPECIALTY_ICONS: Record<DoctorSpecialtyIcon, LucideIcon> = {
  tooth: SmilePlus,
  sparkles: Sparkles,
  activity: Activity,
};

export const DOCTORS: readonly Doctor[] = [
  {
    id: "dr-gaurav",
    slug: "dr-gaurav",
    name: "Dr. Gaurav Jaiswal",
    designation: "BDS · Dental Surgeon",
    experienceYears: "15+ Years",
    experienceLabel: "Experience",
    specializations: [
      { id: "general", label: "General Dentistry", icon: "tooth" },
      { id: "cosmetic", label: "Cosmetic Dentistry", icon: "sparkles" },
      { id: "rct", label: "Root Canal Treatment", icon: "activity" },
    ],
    imageSrc: "/images/hero/drgaurav.png",
    imageAlt: "Dr. Gaurav Jaiswal, Dental Surgeon at Krati Dental Care",
  },
] as const;

/** Section copy — separate from doctor records for CMS-friendly editing. */
export const DOCTORS_SECTION = {
  badge: "Our Doctor",
  heading: "Meet the expert behind",
  headingAccent: "thousands of healthy smiles",
  description:
    "Compassionate care and advanced expertise for you and your family.",
} as const;
