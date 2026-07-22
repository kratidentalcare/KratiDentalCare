import { PublicPageHero } from "@/components/website/public-page-hero";

import { CONTACT_PAGE } from "./contact-page-data";
import { ContactPageBreadcrumb } from "./contact-page-breadcrumb";

export type ContactPageHeroProps = {
  className?: string;
};

/**
 * Contact page intro — cinematic clinic reception hero.
 */
export function ContactPageHero({ className }: ContactPageHeroProps) {
  return (
    <PublicPageHero
      id="contact-page-heading"
      className={className}
      eyebrow={CONTACT_PAGE.eyebrow}
      heading={CONTACT_PAGE.heading}
      headingAccent={CONTACT_PAGE.headingAccent}
      description={CONTACT_PAGE.description}
      ctaLabel={CONTACT_PAGE.ctaLabel}
      breadcrumb={<ContactPageBreadcrumb tone="onMedia" />}
      imageSrc="/images/hero/hero-banner-2.png"
      imageAlt="Krati Dental Care clinic reception"
      imagePosition="object-center"
    />
  );
}
