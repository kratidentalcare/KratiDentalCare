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
  /** Short number/label for the floating experience badge (e.g. "15+"). */
  experienceYears: string;
  experienceLabel: string;
  blurb: string;
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
    designation: "BDS MDS · Periodontist & Implantologist",
    experienceYears: "16+",
    experienceLabel: "Years of trusted care",
    blurb:
      "Precision dentistry with a gentle approach — focused on comfort, clarity, and lasting results for every patient.",
    specializations: [
      { id: "fmr", label: "Full Mouth Rehabilitation (FMR)", icon: "tooth" },
      { id: "implants", label: "Dental Implants", icon: "sparkles" },
      { id: "rct", label: "Single sitting Root Canal", icon: "activity" },
      { id: "perio", label: "Perio Surgeries", icon: "tooth" },
    ],
    imageSrc: "/images/hero/drgaurav.jpeg",
    imageAlt:
      "Dr. Gaurav Jaiswal, Periodontist & Implantologist at Krati Dental Care",
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
