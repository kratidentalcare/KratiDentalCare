import {
  Activity,
  BadgeCheck,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

/**
 * Why Choose Us feature row.
 * Kept serializable-friendly for a future MongoDB/CMS migration
 * (icon names can be mapped server-side later).
 */
export interface WhyChooseUsFeature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const WHY_CHOOSE_US_FEATURES: readonly WhyChooseUsFeature[] = [
  {
    id: "advanced-technology",
    title: "Advanced Technology",
    description: "Modern imaging and precision tools",
    icon: Activity,
  },
  {
    id: "certified-specialists",
    title: "Certified Specialists",
    description: "Experienced, trained dental team",
    icon: BadgeCheck,
  },
  {
    id: "personalized-plans",
    title: "Personalized Plans",
    description: "Treatment built around your needs",
    icon: HeartHandshake,
  },
] as const;
