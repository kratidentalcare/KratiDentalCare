/**
 * Homepage FAQ section copy.
 * FAQ records are loaded from MongoDB via the FAQ CMS.
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Section copy — separate from FAQ records for CMS-friendly editing. */
export const FAQ_SECTION = {
  badge: "FAQ",
  heading: "Everything you need to know",
  headingAccent: "before your visit",
  description:
    "Answers about appointments, treatments, payments, and dental care.",
  ctaTitle: "Still have questions?",
  ctaDescription: "Our team is happy to help.",
  ctaLabel: "Contact Us",
} as const;
