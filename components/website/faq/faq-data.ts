/**
 * Homepage FAQ entries.
 * Kept serializable-friendly for a future MongoDB/CMS migration.
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    id: "book-appointment",
    question: "How can I book an appointment?",
    answer:
      "You can book online through our website, call the clinic during working hours, or walk in to schedule at the front desk. Online booking is available 24/7 and usually confirms within a few minutes.",
  },
  {
    id: "emergency-care",
    question: "Do you provide emergency dental care?",
    answer:
      "Yes. We reserve same-day slots for dental emergencies such as severe tooth pain, broken teeth, or swelling. Call us as soon as possible so we can prioritize your visit.",
  },
  {
    id: "first-visit",
    question: "What should I bring to my first visit?",
    answer:
      "Please bring a valid ID, any previous dental records or X-rays if available, a list of current medications, and your insurance details. Arriving 10–15 minutes early helps us complete your registration smoothly.",
  },
  {
    id: "insurance",
    question: "Do you accept dental insurance?",
    answer:
      "We work with most major dental insurance plans. Our team can verify your coverage before treatment and explain any out-of-pocket costs clearly so there are no surprises.",
  },
  {
    id: "visit-frequency",
    question: "How often should I visit the dentist?",
    answer:
      "Most patients benefit from a checkup and cleaning every six months. If you have gum disease, braces, or other ongoing concerns, we may recommend more frequent visits tailored to your needs.",
  },
  {
    id: "painless-treatments",
    question: "Are treatments painless?",
    answer:
      "We use modern techniques and local anesthesia to keep procedures as comfortable as possible. If you feel anxious, tell us — we offer gentle care options and will walk you through each step.",
  },
  {
    id: "children",
    question: "Do you treat children?",
    answer:
      "Absolutely. We provide friendly pediatric dental care for children of all ages, from first checkups to preventive treatments, in a calm and welcoming environment.",
  },
  {
    id: "reschedule",
    question: "Can I reschedule my appointment online?",
    answer:
      "Yes. You can reschedule or cancel through your booking confirmation link or by contacting the clinic. We appreciate at least 24 hours’ notice so we can offer the slot to another patient.",
  },
] as const;

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
