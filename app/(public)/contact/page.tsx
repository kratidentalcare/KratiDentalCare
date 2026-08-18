import type { Metadata } from "next";
import { Suspense } from "react";

import {
  ContactFormSection,
  ContactPageHero,
} from "@/components/website/contact-page";
import {
  StreamedContactDetails,
  StreamedContactMap,
} from "@/components/website/contact-page/streamed-contact";
import { StreamedFaq } from "@/components/website/faq/streamed-faq";
import {
  ContactDetailsSkeleton,
  ContactMapSkeleton,
  FaqSectionSkeleton,
  FinalCtaSkeleton,
} from "@/components/website/public-section-skeletons";
import { StreamedFinalCta } from "@/components/website/services-page/streamed-final-cta";
import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { createPublicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Contact",
  description: `Contact ${APP_NAME} — address, phone, email, clinic hours, and a message form for appointments or questions.`,
  path: ROUTES.PUBLIC.CONTACT,
});

/**
 * Dedicated public Contact page.
 * Hero + form are static; identity, map, FAQ, and CTA stream.
 */
export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      <ContactPageHero />
      <Suspense fallback={<ContactDetailsSkeleton />}>
        <StreamedContactDetails />
      </Suspense>
      <ContactFormSection />
      <Suspense fallback={<ContactMapSkeleton />}>
        <StreamedContactMap />
      </Suspense>
      <Suspense fallback={<FaqSectionSkeleton />}>
        <StreamedFaq />
      </Suspense>
      <Suspense fallback={<FinalCtaSkeleton />}>
        <StreamedFinalCta />
      </Suspense>
    </div>
  );
}
