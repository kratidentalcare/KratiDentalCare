export type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  description:
    "How Krati Dental Care collects, uses, and protects your personal information when you visit our website or book care with us.",
  lastUpdated: "24 July 2026",
  sections: [
    {
      id: "introduction",
      title: "1. Introduction",
      paragraphs: [
        "Krati Dental Care (“we”, “us”, or “our”) respects your privacy. This Privacy Policy explains what information we collect through our website and related services, why we collect it, and how we keep it safe.",
        "By using our website, booking an appointment online, or contacting us through our forms, you agree to the practices described here.",
      ],
    },
    {
      id: "information-we-collect",
      title: "2. Information We Collect",
      paragraphs: [
        "We may collect the following categories of information:",
      ],
      bullets: [
        "Identity and contact details — such as your name, phone number, email address, age, and gender when you book an appointment or send a message.",
        "Appointment details — preferred date and time, reason for visit, and related clinical notes you choose to share.",
        "Technical data — IP address, browser type, device information, and pages visited, collected automatically to improve site performance and security.",
        "Communications — messages you send through our contact form or other channels.",
      ],
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Information",
      paragraphs: [
        "We use your information to:",
      ],
      bullets: [
        "Schedule, confirm, and manage appointments.",
        "Respond to enquiries and provide patient support.",
        "Improve our website, booking experience, and clinic operations.",
        "Meet legal, regulatory, and professional obligations where required.",
        "Send important service updates related to your visit (for example, appointment confirmations).",
      ],
    },
    {
      id: "sharing",
      title: "4. Sharing of Information",
      paragraphs: [
        "We do not sell your personal information. We may share limited data with trusted service providers who help us operate our website, booking system, hosting, or communications — only as needed to deliver those services and under appropriate safeguards.",
        "We may also disclose information if required by law, regulation, or a valid legal request, or to protect the rights, safety, and property of our patients, staff, or clinic.",
      ],
    },
    {
      id: "cookies",
      title: "5. Cookies & Similar Technologies",
      paragraphs: [
        "Our website may use cookies or similar technologies to remember preferences, keep sessions secure, and understand how the site is used. You can control cookies through your browser settings; disabling some cookies may affect certain features.",
      ],
    },
    {
      id: "retention",
      title: "6. Data Retention",
      paragraphs: [
        "We retain personal information only as long as needed for the purposes described in this policy, including appointment records, patient care, and legal or accounting requirements. When information is no longer required, we take reasonable steps to delete or anonymise it.",
      ],
    },
    {
      id: "security",
      title: "7. Security",
      paragraphs: [
        "We use reasonable administrative, technical, and organisational measures to protect your information. No method of transmission or storage is completely secure; if you suspect unauthorised access, please contact us promptly.",
      ],
    },
    {
      id: "your-rights",
      title: "8. Your Rights",
      paragraphs: [
        "Subject to applicable law, you may request access to, correction of, or deletion of personal information we hold about you, or ask questions about how it is processed. To exercise these rights, contact us using the details on our Contact page.",
      ],
    },
    {
      id: "children",
      title: "9. Children’s Privacy",
      paragraphs: [
        "Our services may be used by parents or guardians to book care for minors. We do not knowingly collect personal information from children online without appropriate adult involvement. If you believe we have collected such information in error, please contact us so we can review and address it.",
      ],
    },
    {
      id: "changes",
      title: "10. Changes to This Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. The “Last updated” date at the top of this page will reflect the latest revision. Continued use of our website after changes means you accept the updated policy.",
      ],
    },
    {
      id: "contact",
      title: "11. Contact Us",
      paragraphs: [
        "If you have questions about this Privacy Policy or our data practices, please reach out through our Contact page or call the clinic during working hours. We will do our best to respond promptly.",
      ],
    },
  ],
} as const;

export const TERMS_AND_CONDITIONS: LegalDocument = {
  eyebrow: "Legal",
  title: "Terms & Conditions",
  description:
    "The rules that apply when you use the Krati Dental Care website, book appointments, or request clinic services online.",
  lastUpdated: "24 July 2026",
  sections: [
    {
      id: "agreement",
      title: "1. Agreement to Terms",
      paragraphs: [
        "These Terms & Conditions (“Terms”) govern your use of the Krati Dental Care website and related online booking or enquiry features. By accessing or using our site, you agree to these Terms. If you do not agree, please do not use the website.",
      ],
    },
    {
      id: "services",
      title: "2. Our Services",
      paragraphs: [
        "Krati Dental Care provides dental care and related information through our clinic and website. Online content is for general information only and does not replace a professional clinical examination, diagnosis, or treatment plan.",
        "Treatment recommendations are made only after appropriate in-clinic assessment by a qualified dental professional.",
      ],
    },
    {
      id: "accounts-booking",
      title: "3. Appointments & Bookings",
      paragraphs: [
        "Online booking requests are subject to clinic confirmation. Submitting a request does not guarantee a confirmed appointment until we verify availability and contact you if needed.",
      ],
      bullets: [
        "Provide accurate contact and patient details when booking.",
        "Arrive on time for confirmed appointments.",
        "Notify us as early as possible if you need to reschedule or cancel.",
        "Emergency or urgent care may require calling the clinic directly.",
      ],
    },
    {
      id: "medical-disclaimer",
      title: "4. Medical Disclaimer",
      paragraphs: [
        "Nothing on this website constitutes medical advice. Individual results vary. Always seek the guidance of a qualified dentist or physician for questions about your oral health. If you think you may have a dental or medical emergency, contact emergency services or your nearest emergency facility immediately.",
      ],
    },
    {
      id: "acceptable-use",
      title: "5. Acceptable Use",
      paragraphs: [
        "You agree not to misuse the website, including by attempting to disrupt its operation, accessing data without authorisation, submitting false or harmful content, or using the site for unlawful purposes.",
      ],
    },
    {
      id: "intellectual-property",
      title: "6. Intellectual Property",
      paragraphs: [
        "All website content — including text, graphics, logos, images, and layout — is owned by Krati Dental Care or its licensors and is protected by applicable intellectual property laws. You may not copy, modify, distribute, or exploit content without our prior written consent, except for personal, non-commercial viewing.",
      ],
    },
    {
      id: "third-party",
      title: "7. Third-Party Links & Tools",
      paragraphs: [
        "Our site may link to third-party websites or embed tools (for example maps). We are not responsible for the content, privacy practices, or availability of those third parties. Use them at your own discretion.",
      ],
    },
    {
      id: "liability",
      title: "8. Limitation of Liability",
      paragraphs: [
        "To the fullest extent permitted by law, Krati Dental Care is not liable for indirect, incidental, or consequential damages arising from your use of the website or reliance on online content. Clinical care is governed by applicable professional standards and separate patient agreements where relevant.",
        "We strive for accuracy but do not warrant that the website will be uninterrupted, error-free, or completely up to date at all times.",
      ],
    },
    {
      id: "privacy",
      title: "9. Privacy",
      paragraphs: [
        "Your use of the website is also governed by our Privacy Policy, which explains how we collect and handle personal information.",
      ],
    },
    {
      id: "changes-terms",
      title: "10. Changes to These Terms",
      paragraphs: [
        "We may revise these Terms periodically. The “Last updated” date shows when changes were last made. Continued use of the website after updates constitutes acceptance of the revised Terms.",
      ],
    },
    {
      id: "governing-law",
      title: "11. Governing Law",
      paragraphs: [
        "These Terms are governed by the laws of India. Courts in the competent jurisdiction where our clinic operates shall have exclusive authority over disputes arising from these Terms, subject to applicable law.",
      ],
    },
    {
      id: "contact-terms",
      title: "12. Contact",
      paragraphs: [
        "Questions about these Terms can be sent through our Contact page or by calling the clinic during working hours.",
      ],
    },
  ],
} as const;
