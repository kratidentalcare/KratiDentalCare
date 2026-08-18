import type { Metadata } from "next";
import { Suspense } from "react";

import { Doctors } from "@/components/website/doctors";
import { StreamedFaq } from "@/components/website/faq/streamed-faq";
import { Hero } from "@/components/website/hero";
import {
  FaqSectionSkeleton,
  FinalCtaSkeleton,
} from "@/components/website/public-section-skeletons";
import { Services } from "@/components/website/services";
import { StreamedFinalCta } from "@/components/website/services-page/streamed-final-cta";
import { Testimonials } from "@/components/website/testimonials";
import { WhyChooseUs } from "@/components/website/why-choose-us";
import { APP_DESCRIPTION, APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";

export const dynamic = "force-static";
export const revalidate = 300;

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
 * Public homepage shell. Static sections paint immediately; FAQ and CTA
 * stream behind Suspense so Mongo does not block Hero.
 */
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/*
        Section order:
        Navbar (layout) → Hero → Why Choose Us → Services → Doctors
        → Testimonials → FAQ → Final CTA → Footer (layout)
      */}
      <Hero />
      <WhyChooseUs />
      <Services />
      <Doctors />
      <Testimonials />
      <Suspense fallback={<FaqSectionSkeleton />}>
        <StreamedFaq />
      </Suspense>
      <Suspense fallback={<FinalCtaSkeleton />}>
        <StreamedFinalCta />
      </Suspense>
    </div>
  );
}
