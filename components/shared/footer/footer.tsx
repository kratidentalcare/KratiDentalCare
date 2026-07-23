import Link from "next/link";

import { PageContainer } from "@/components/layout";
import { Logo } from "@/components/shared/navbar";
import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import {
  FooterBottom,
  type FooterLegalLink,
} from "./footer-bottom";
import {
  FooterContact,
  type FooterContactInfo,
} from "./footer-contact";
import {
  FooterLinkList,
  DEFAULT_QUICK_LINKS,
  type FooterLinkItem,
} from "./footer-links";
import { FooterMap } from "./footer-map";
import {
  FooterSocial,
  type FooterSocialItem,
} from "./footer-social";

/** Default tagline until website_settings / CMS supplies copy. */
export const DEFAULT_FOOTER_TAGLINE =
  "We provide modern, affordable and compassionate dental care for the entire family.";

export type FooterProps = {
  tagline?: string;
  quickLinks?: readonly FooterLinkItem[];
  /** Optional services group — rendered under Quick Links when non-empty. */
  serviceLinks?: readonly FooterLinkItem[];
  contact?: FooterContactInfo;
  social?: readonly FooterSocialItem[];
  legalLinks?: readonly FooterLegalLink[];
  copyrightOwner?: string;
  className?: string;
};

/**
 * Public marketing footer — mobile-first stack, 3-column on desktop + map.
 * Design is fixed; clinic/contact/link data is injected from ClinicSettings.
 */
export function Footer({
  tagline = DEFAULT_FOOTER_TAGLINE,
  quickLinks = DEFAULT_QUICK_LINKS,
  serviceLinks = [],
  contact,
  social,
  legalLinks,
  copyrightOwner = APP_NAME,
  className,
}: FooterProps) {
  return (
    <footer
      className={cn(
        "mt-auto w-full border-t border-brand-navy/8 bg-white font-montserrat",
        className,
      )}
    >
      <PageContainer
        size="xl"
        className="py-10 sm:py-12 lg:py-[var(--section-padding-y)]"
      >
        <div className="flex flex-col gap-0 lg:grid lg:grid-cols-3 lg:gap-10 xl:gap-14">
          {/* Brand */}
          <div className="flex flex-col items-center pb-8 text-center sm:items-start sm:text-left lg:pb-0">
            <Logo />
            <p className="mt-4 max-w-[20rem] text-[0.9375rem] leading-relaxed text-brand-muted sm:max-w-sm sm:text-sm">
              {tagline}
            </p>
            <FooterSocial items={social} className="mt-5 sm:mt-6" />

            <FooterMap
              className="mt-5 sm:mt-6"
              embedUrl={contact?.mapsEmbedUrl}
              mapsUrl={contact?.mapsUrl}
              clinicName={contact?.clinicName ?? copyrightOwner}
            />

            <Link
              href={ROUTES.PUBLIC.BOOK}
              className={cn(
                "mt-6 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-full sm:w-auto sm:px-6 lg:hidden",
                "bg-brand-blue px-5 text-sm font-semibold text-white",
                "shadow-[0_8px_22px_color-mix(in_srgb,var(--brand-blue)_28%,transparent)]",
                "transition-all duration-200",
                "hover:bg-brand-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
                "active:scale-[0.98]",
              )}
            >
              Book and Smile
            </Link>
          </div>

          {/* Quick links (+ optional services) */}
          <div className="border-t border-[#E5E7EB]/80 py-8 lg:border-t-0 lg:py-0">
            <FooterLinkList title="Quick Links" links={quickLinks} />
            {serviceLinks.length > 0 ? (
              <FooterLinkList
                title="Services"
                links={serviceLinks}
                className="mt-8"
              />
            ) : null}
          </div>

          {/* Contact */}
          <div className="border-t border-[#E5E7EB]/80 pt-8 lg:border-t-0 lg:pt-0">
            <FooterContact contact={contact} />
          </div>
        </div>
      </PageContainer>

      <FooterBottom
        copyrightOwner={copyrightOwner}
        legalLinks={legalLinks}
      />
    </footer>
  );
}
