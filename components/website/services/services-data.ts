import {
  Activity,
  HeartPulse,
  ShieldCheck,
  Smile,
  SmilePlus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Homepage services preview item.
 * Kept serializable-friendly for a future MongoDB/CMS migration
 * (icon names can be mapped server-side later).
 */
export interface ServicePreviewItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const SERVICES_PREVIEW: readonly ServicePreviewItem[] = [
  {
    id: "general-dentistry",
    title: "General Dentistry",
    description:
      "Routine checkups, cleanings and preventive care for healthy teeth.",
    icon: SmilePlus,
  },
  {
    id: "cosmetic-dentistry",
    title: "Cosmetic Dentistry",
    description:
      "Smile makeovers, veneers and professional teeth whitening.",
    icon: Sparkles,
  },
  {
    id: "dental-implants",
    title: "Dental Implants",
    description:
      "Permanent solutions for missing teeth with natural-looking results.",
    icon: ShieldCheck,
  },
  {
    id: "root-canal-treatment",
    title: "Root Canal Treatment",
    description:
      "Pain-free root canal procedures using advanced technology.",
    icon: Activity,
  },
  {
    id: "orthodontics",
    title: "Orthodontics",
    description:
      "Braces and clear aligners for perfectly aligned smiles.",
    icon: Smile,
  },
  {
    id: "emergency-dental-care",
    title: "Emergency Dental Care",
    description:
      "Immediate treatment for dental emergencies and accidents.",
    icon: HeartPulse,
  },
] as const;
