import type { Metadata } from "next";
import { Suspense } from "react";

import { DoctorsPageHero } from "@/components/website/doctors-page";
import { StreamedDoctorsDirectory } from "@/components/website/doctors-page/streamed-doctors";
import {
  DoctorsDirectorySkeleton,
  FinalCtaSkeleton,
} from "@/components/website/public-section-skeletons";
import { StreamedFinalCta } from "@/components/website/services-page/streamed-final-cta";
import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { createPublicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Doctors",
  description: `Meet the dentists at ${APP_NAME} — experienced clinicians dedicated to gentle, precise dental care.`,
  path: ROUTES.PUBLIC.DOCTORS,
});

/**
 * Dedicated public Doctors page.
 * Hero is static; profiles and CTA stream from Mongo.
 */
export default function DoctorsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <DoctorsPageHero />
      <Suspense fallback={<DoctorsDirectorySkeleton />}>
        <StreamedDoctorsDirectory />
      </Suspense>
      <Suspense fallback={<FinalCtaSkeleton />}>
        <StreamedFinalCta />
      </Suspense>
    </div>
  );
}
