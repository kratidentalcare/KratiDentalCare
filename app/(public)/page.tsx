import type { Metadata } from "next";

import { Doctors } from "@/components/website/doctors";
import { Faq } from "@/components/website/faq";
import { Hero } from "@/components/website/hero";
import { Services } from "@/components/website/services";
import { ServicesFinalCta } from "@/components/website/services-page";
import { Testimonials } from "@/components/website/testimonials";
import { WhyChooseUs } from "@/components/website/why-choose-us";
import { APP_DESCRIPTION, APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { getPublicFooterData } from "@/features/clinic-settings";
import { listActiveFaqs } from "@/features/faqs/services/list-active-faqs";

export const metadata: Metadata = {
  title: {
    absolute: APP_NAME,
  },
  description: APP_DESCRIPTION,
  alternates: {
    canonical: ROUTES.PUBLIC.HOME,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: ROUTES.PUBLIC.HOME,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

/**
 * Public homepage shell. Section components plug in below Hero —
 * keep this file free of business logic beyond data wiring.
 */
export default async function HomePage() {
  const [faqs, footerData] = await Promise.all([
    listActiveFaqs(),
    getPublicFooterData(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      {/*
        Section order:
        Navbar (layout) → Hero → Why Choose Us → Services → Doctors
        → Testimonials → FAQ → Final CTA → Footer (layout)
      */}
      <Hero mapsUrl={footerData?.contact.mapsUrl} />
      <WhyChooseUs />
      <Services />
      <Doctors />
      <Testimonials />
      <Faq items={faqs ?? []} />
      <ServicesFinalCta
        phone={footerData?.contact.phone}
        phoneHref={footerData?.contact.phoneHref}
      />
    </div>
  );
}
