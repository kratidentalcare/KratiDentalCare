import { PublicPageHero } from "@/components/website/public-page-hero";

import { SERVICES_PAGE } from "./services-catalog-data";
import { ServicesPageBreadcrumb } from "./services-page-breadcrumb";

export type ServicesPageHeroProps = {
  className?: string;
};

/**
 * Services page intro — cinematic photo hero with clinic atmosphere.
 */
export function ServicesPageHero({ className }: ServicesPageHeroProps) {
  return (
    <PublicPageHero
      id="services-page-heading"
      className={className}
      eyebrow={SERVICES_PAGE.eyebrow}
      heading={SERVICES_PAGE.heading}
      headingAccent={SERVICES_PAGE.headingAccent}
      description={SERVICES_PAGE.description}
      ctaLabel={SERVICES_PAGE.ctaLabel}
      breadcrumb={<ServicesPageBreadcrumb tone="onMedia" />}
      imageSrc="/images/hero/services.png"
      imageAlt="Comfortable dental care at Krati Dental Care"
      imagePosition="object-[center_35%]"
    />
  );
}
