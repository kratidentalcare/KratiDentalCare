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
  badge: "Frequently Asked Questions",
  heading: "Everything You Need to Know",
  headingAccent: "Before Your Visit",
  description:
    "Find answers to the most common questions about appointments, treatments, payments and dental care.",
  ctaTitle: "Still have questions?",
  ctaDescription: "Our team is happy to help.",
  ctaLabel: "Contact Us",
} as const;
