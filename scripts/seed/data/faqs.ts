export type SeedFaq = {
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
};

/** ~15 realistic FAQs for an Indian dental clinic demo. */
export const SEED_FAQS: readonly SeedFaq[] = [
  {
    displayOrder: 1,
    category: "booking",
    question: "How can I book an appointment at Krati Dental Care?",
    answer:
      "You can book online through our website, call the clinic during working hours, or walk in to schedule at the front desk. Online booking is available 24/7 and usually confirms within a few minutes.",
  },
  {
    displayOrder: 2,
    category: "booking",
    question: "Can I reschedule or cancel my appointment online?",
    answer:
      "Yes. Use your booking confirmation link or call the clinic. We appreciate at least 24 hours’ notice so we can offer the slot to another patient.",
  },
  {
    displayOrder: 3,
    category: "emergency",
    question: "Do you provide emergency dental care?",
    answer:
      "Yes. We reserve same-day slots for dental emergencies such as severe tooth pain, broken teeth, or swelling. Call us as soon as possible so we can prioritize your visit.",
  },
  {
    displayOrder: 4,
    category: "visit",
    question: "What should I bring to my first visit?",
    answer:
      "Please bring a valid ID, any previous dental records or X-rays if available, a list of current medications, and insurance details if applicable. Arriving 10–15 minutes early helps registration go smoothly.",
  },
  {
    displayOrder: 5,
    category: "insurance",
    question: "Do you accept dental insurance?",
    answer:
      "We work with most major dental insurance plans. Our team can verify your coverage before treatment and explain any out-of-pocket costs clearly.",
  },
  {
    displayOrder: 6,
    category: "care",
    question: "How often should I visit the dentist?",
    answer:
      "Most patients benefit from a checkup and cleaning every six months. If you have gum disease, braces, or other ongoing concerns, we may recommend more frequent visits.",
  },
  {
    displayOrder: 7,
    category: "care",
    question: "Are treatments painless?",
    answer:
      "We use modern techniques and local anesthesia to keep procedures as comfortable as possible. If you feel anxious, tell us — we offer gentle care options and will walk you through each step.",
  },
  {
    displayOrder: 8,
    category: "pediatric",
    question: "Do you treat children?",
    answer:
      "Absolutely. We provide friendly pediatric dental care for children of all ages, from first checkups to preventive treatments, in a calm and welcoming environment.",
  },
  {
    displayOrder: 9,
    category: "payment",
    question: "Which payment methods do you accept?",
    answer:
      "We accept UPI, debit/credit cards, net banking, and cash. For larger treatment plans we can discuss staged payments at the front desk.",
  },
  {
    displayOrder: 10,
    category: "treatment",
    question: "How long does a root canal usually take?",
    answer:
      "Most root canal treatments are completed in one or two visits depending on infection severity and tooth anatomy. Your dentist will explain the plan after examination and X-rays.",
  },
  {
    displayOrder: 11,
    category: "treatment",
    question: "Is teeth whitening safe?",
    answer:
      "Professional whitening supervised by a dentist is safe for most patients. We assess enamel health and sensitivity first and recommend the right option for your smile.",
  },
  {
    displayOrder: 12,
    category: "hours",
    question: "What are the clinic working hours?",
    answer:
      "We are typically open Monday to Saturday. Exact opening and closing times are shown on the homepage and booking page, and may vary on public holidays.",
  },
  {
    displayOrder: 13,
    category: "hygiene",
    question: "How do you maintain sterilization and hygiene?",
    answer:
      "We follow strict sterilization protocols for instruments, use disposable items where appropriate, and maintain a clean clinical environment for every patient visit.",
  },
  {
    displayOrder: 14,
    category: "follow-up",
    question: "Will I receive a digital prescription after my visit?",
    answer:
      "Yes. After a completed consultation, your dentist can issue a digital prescription that remains available in your patient history for future reference.",
  },
  {
    displayOrder: 15,
    category: "location",
    question: "Where is the clinic located and is parking available?",
    answer:
      "Krati Dental Care is based in Lucknow, Uttar Pradesh. Street parking and nearby paid parking options are usually available; call ahead if you need directions.",
  },
] as const;
