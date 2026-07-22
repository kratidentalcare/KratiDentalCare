import type { Metadata } from "next";

import { Faq } from "@/components/website/faq";
import {
  ServicesFinalCta,
  ServicesPageGrid,
  ServicesPageHero,
  TreatmentProcess,
} from "@/components/website/services-page";
import { WhyChooseUs } from "@/components/website/why-choose-us";
import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { getPublicFooterData } from "@/features/clinic-settings";
import { listActiveFaqs } from "@/features/faqs/services/list-active-faqs";
import { createPublicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Services",
  description: `Explore premium dental services at ${APP_NAME} — general care, cosmetics, implants, orthodontics, and emergency treatment.`,
  path: ROUTES.PUBLIC.SERVICES,
});

/**
 * Dedicated public Services page.
 * Reuses homepage Why Choose Us + FAQ; clinic phone powers the final CTA.
 */
export default async function ServicesPage() {
  const [faqs, footerData] = await Promise.all([
    listActiveFaqs(),
    getPublicFooterData(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <ServicesPageHero />
      <ServicesPageGrid />
      <TreatmentProcess />
      <WhyChooseUs />
      <Faq items={faqs ?? []} />
      <ServicesFinalCta
        phone={footerData?.contact.phone}
        phoneHref={footerData?.contact.phoneHref}
      />
    </div>
  );
}
