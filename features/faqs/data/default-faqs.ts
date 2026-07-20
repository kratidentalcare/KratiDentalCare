/**
 * Default homepage FAQs migrated from the previous hardcoded section.
 * Seeded once when the `faqs` collection is empty.
 */

export type DefaultFaqSeed = {
  question: string;
  answer: string;
  displayOrder: number;
};

export const DEFAULT_FAQS: readonly DefaultFaqSeed[] = [
  {
    displayOrder: 1,
    question: "How can I book an appointment?",
    answer:
      "You can book online through our website, call the clinic during working hours, or walk in to schedule at the front desk. Online booking is available 24/7 and usually confirms within a few minutes.",
  },
  {
    displayOrder: 2,
    question: "Do you provide emergency dental care?",
    answer:
      "Yes. We reserve same-day slots for dental emergencies such as severe tooth pain, broken teeth, or swelling. Call us as soon as possible so we can prioritize your visit.",
  },
  {
    displayOrder: 3,
    question: "What should I bring to my first visit?",
    answer:
      "Please bring a valid ID, any previous dental records or X-rays if available, a list of current medications, and your insurance details. Arriving 10–15 minutes early helps us complete your registration smoothly.",
  },
  {
    displayOrder: 4,
    question: "Do you accept dental insurance?",
    answer:
      "We work with most major dental insurance plans. Our team can verify your coverage before treatment and explain any out-of-pocket costs clearly so there are no surprises.",
  },
  {
    displayOrder: 5,
    question: "How often should I visit the dentist?",
    answer:
      "Most patients benefit from a checkup and cleaning every six months. If you have gum disease, braces, or other ongoing concerns, we may recommend more frequent visits tailored to your needs.",
  },
  {
    displayOrder: 6,
    question: "Are treatments painless?",
    answer:
      "We use modern techniques and local anesthesia to keep procedures as comfortable as possible. If you feel anxious, tell us — we offer gentle care options and will walk you through each step.",
  },
  {
    displayOrder: 7,
    question: "Do you treat children?",
    answer:
      "Absolutely. We provide friendly pediatric dental care for children of all ages, from first checkups to preventive treatments, in a calm and welcoming environment.",
  },
  {
    displayOrder: 8,
    question: "Can I reschedule my appointment online?",
    answer:
      "Yes. You can reschedule or cancel through your booking confirmation link or by contacting the clinic. We appreciate at least 24 hours’ notice so we can offer the slot to another patient.",
  },
] as const;
