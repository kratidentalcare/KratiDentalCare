import type { Metadata } from "next";
import { Suspense } from "react";

import { StreamedFaq } from "@/components/website/faq/streamed-faq";
import {
  FaqSectionSkeleton,
  FinalCtaSkeleton,
} from "@/components/website/public-section-skeletons";
import {
  ServicesPageGrid,
  ServicesPageHero,
  TreatmentProcess,
} from "@/components/website/services-page";
import { StreamedFinalCta } from "@/components/website/services-page/streamed-final-cta";
import { WhyChooseUs } from "@/components/website/why-choose-us";
import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { createPublicPageMetadata } from "@/lib/seo/public-metadata";

export const dynamic = "force-static";
export const revalidate = 300;

export const metadata: Metadata = createPublicPageMetadata({
  title: "Services",
  description: `Explore premium dental services at ${APP_NAME} — general care, cosmetics, implants, orthodontics, and emergency treatment.`,
  path: ROUTES.PUBLIC.SERVICES,
});

/**
 * Dedicated public Services page.
 * Hero and catalog are static; FAQ + CTA stream clinic data.
 */
export default function ServicesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <ServicesPageHero />
      <ServicesPageGrid />
      <TreatmentProcess />
      <WhyChooseUs />
      <Suspense fallback={<FaqSectionSkeleton />}>
        <StreamedFaq />
      </Suspense>
      <Suspense fallback={<FinalCtaSkeleton />}>
        <StreamedFinalCta />
      </Suspense>
    </div>
  );
}
