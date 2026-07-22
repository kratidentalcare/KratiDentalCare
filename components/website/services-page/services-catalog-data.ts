import {
  Activity,
  Baby,
  HeartPulse,
  Scissors,
  ShieldCheck,
  Smile,
  SmilePlus,
  Sparkles,
  SunMedium,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Full Services page catalog.
 * Kept serializable-friendly for a future MongoDB/CMS migration
 * (icon names can be mapped server-side later).
 */
export interface ServiceCatalogItem {
  id: string;
  title: string;
  description: string;
  benefits: readonly string[];
  icon: LucideIcon;
}

export const SERVICES_CATALOG: readonly ServiceCatalogItem[] = [
  {
    id: "general-dentistry",
    title: "General Dentistry",
    description:
      "Routine checkups, cleanings and preventive care that keep your smile healthy year-round.",
    benefits: [
      "Comprehensive oral exams",
      "Professional cleanings",
      "Early problem detection",
    ],
    icon: SmilePlus,
  },
  {
    id: "cosmetic-dentistry",
    title: "Cosmetic Dentistry",
    description:
      "Enhance the shape, color and harmony of your smile with refined aesthetic treatments.",
    benefits: [
      "Natural-looking veneers",
      "Smile contouring",
      "Confidence-first results",
    ],
    icon: Sparkles,
  },
  {
    id: "root-canal-treatment",
    title: "Root Canal Treatment",
    description:
      "Gentle, precision-focused care to relieve pain and preserve your natural tooth.",
    benefits: [
      "Modern pain management",
      "Tooth-saving approach",
      "Faster recovery support",
    ],
    icon: Activity,
  },
  {
    id: "teeth-whitening",
    title: "Teeth Whitening",
    description:
      "Brighten stained or dulled enamel with professional whitening tailored to your smile.",
    benefits: [
      "Noticeable shade improvement",
      "Safe, supervised treatment",
      "Longer-lasting brightness",
    ],
    icon: SunMedium,
  },
  {
    id: "dental-implants",
    title: "Dental Implants",
    description:
      "Permanent, natural-feeling replacements for missing teeth with lasting stability.",
    benefits: [
      "Secure bite strength",
      "Preserve jawbone health",
      "Lifelike aesthetics",
    ],
    icon: ShieldCheck,
  },
  {
    id: "orthodontics",
    title: "Orthodontics",
    description:
      "Align crowded or uneven teeth with braces and clear aligner options for every lifestyle.",
    benefits: [
      "Braces & clear aligners",
      "Improved bite function",
      "Custom treatment plans",
    ],
    icon: Smile,
  },
  {
    id: "pediatric-dentistry",
    title: "Pediatric Dentistry",
    description:
      "Gentle, age-appropriate care that helps children build healthy habits and fear-free visits.",
    benefits: [
      "Kid-friendly approach",
      "Preventive sealants",
      "Growth-focused guidance",
    ],
    icon: Baby,
  },
  {
    id: "tooth-extraction",
    title: "Tooth Extraction",
    description:
      "Comfortable extraction care when removal is the safest path to oral health.",
    benefits: [
      "Minimally invasive technique",
      "Careful aftercare guidance",
      "Smooth recovery support",
    ],
    icon: Scissors,
  },
  {
    id: "smile-makeover",
    title: "Smile Makeover",
    description:
      "A personalized combination of treatments designed to transform your full smile.",
    benefits: [
      "Custom smile design",
      "Coordinated multi-step care",
      "Balanced, natural results",
    ],
    icon: WandSparkles,
  },
  {
    id: "emergency-dental-care",
    title: "Emergency Dental Care",
    description:
      "Prompt relief for sudden pain, trauma or urgent dental concerns when you need it most.",
    benefits: [
      "Same-day priority care",
      "Rapid pain relief focus",
      "Stabilizing treatment plans",
    ],
    icon: HeartPulse,
  },
] as const;

export const SERVICES_PAGE = {
  eyebrow: "Our Services",
  heading: "Dental care",
  headingAccent: "for every smile",
  description:
    "From preventive visits to advanced treatments — precise, comfortable care with lasting results.",
  ctaLabel: "Book and Smile",
} as const;
