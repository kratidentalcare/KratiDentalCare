import type { Metadata } from "next";

import {
  ContactFormSection,
  ContactInfoCards,
  ContactMapSection,
  ContactPageHero,
  ContactWorkingHours,
} from "@/components/website/contact-page";
import { Faq } from "@/components/website/faq";
import { ServicesFinalCta } from "@/components/website/services-page";
import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { getPublicContactPageData } from "@/features/contact";
import { listActiveFaqs } from "@/features/faqs/services/list-active-faqs";
import { createPublicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Contact",
  description: `Contact ${APP_NAME} — address, phone, email, clinic hours, and a message form for appointments or questions.`,
  path: ROUTES.PUBLIC.CONTACT,
});

/**
 * Dedicated public Contact page.
 * Identity + hours from ClinicSettings; messages persist as ContactMessage docs.
 */
export default async function ContactPage() {
  const [pageData, faqs] = await Promise.all([
    getPublicContactPageData(),
    listActiveFaqs(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <ContactPageHero />
      <ContactInfoCards contact={pageData?.contact ?? null} />
      <ContactWorkingHours schedule={pageData?.schedule ?? null} />
      <ContactFormSection />
      <ContactMapSection contact={pageData?.contact ?? null} />
      <Faq items={faqs ?? []} />
      <ServicesFinalCta
        phone={pageData?.contact.phone}
        phoneHref={pageData?.contact.phoneHref}
      />
    </div>
  );
}
