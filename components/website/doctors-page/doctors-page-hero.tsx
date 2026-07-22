import { PublicPageHero } from "@/components/website/public-page-hero";

import { DOCTORS_PAGE } from "./doctors-page-data";
import { DoctorsPageBreadcrumb } from "./doctors-page-breadcrumb";

export type DoctorsPageHeroProps = {
  className?: string;
};

/**
 * Doctors page intro — cinematic photo hero featuring the clinician.
 */
export function DoctorsPageHero({ className }: DoctorsPageHeroProps) {
  return (
    <PublicPageHero
      id="doctors-page-heading"
      className={className}
      eyebrow={DOCTORS_PAGE.eyebrow}
      heading={DOCTORS_PAGE.heading}
      headingAccent={DOCTORS_PAGE.headingAccent}
      description={DOCTORS_PAGE.description}
      ctaLabel={DOCTORS_PAGE.ctaLabel}
      breadcrumb={<DoctorsPageBreadcrumb tone="onMedia" />}
      imageSrc="/images/hero/drgaurav.png"
      imageAlt="Dental specialist at Krati Dental Care"
      imagePosition="object-[center_20%]"
    />
  );
}
