import "server-only";

import { cache } from "react";

import type { FooterContactInfo } from "@/components/shared/footer/footer-contact";
import {
  DEFAULT_QUICK_LINKS,
  type FooterLinkItem,
} from "@/components/shared/footer/footer-links";
import type { FooterSocialItem } from "@/components/shared/footer/footer-social";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/shared/footer/social-icons";
import { FOOTER_LINK_GROUPS } from "@/constants/clinic-settings";
import {
  formatClinicAddress,
  formatClinicWorkingHours,
  toTelHref,
} from "@/features/clinic-settings/lib/format-clinic";
import { toGoogleMapsEmbedUrl } from "@/features/contact/lib/maps-embed";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import type { LeanClinicSettings } from "@/models/clinic-settings";

export function mapClinicContact(
  settings: LeanClinicSettings,
): FooterContactInfo {
  const emergency = settings.emergencyContact?.trim() || null;
  const mapsUrl = settings.googleMapsUrl?.trim() || null;

  return {
    clinicName: settings.clinicName,
    address: formatClinicAddress(settings.address),
    phone: settings.phone,
    phoneHref: toTelHref(settings.phone),
    email: settings.email,
    hours: formatClinicWorkingHours(settings),
    mapsUrl,
    mapsEmbedUrl: toGoogleMapsEmbedUrl(mapsUrl),
    ...(emergency
      ? {
          emergencyLabel: "Emergency Contact",
          emergencyPhone: emergency,
          emergencyPhoneHref: toTelHref(emergency),
        }
      : {}),
  };
}

export function mapClinicSocialLinks(
  socialLinks: LeanClinicSettings["socialLinks"],
): FooterSocialItem[] {
  const items: FooterSocialItem[] = [];

  if (socialLinks.facebook) {
    items.push({
      label: "Facebook",
      href: socialLinks.facebook,
      icon: FacebookIcon,
    });
  }
  if (socialLinks.instagram) {
    items.push({
      label: "Instagram",
      href: socialLinks.instagram,
      icon: InstagramIcon,
    });
  }
  if (socialLinks.twitter) {
    items.push({
      label: "X",
      href: socialLinks.twitter,
      icon: XIcon,
    });
  }
  if (socialLinks.youtube) {
    items.push({
      label: "YouTube",
      href: socialLinks.youtube,
      icon: YouTubeIcon,
    });
  }

  return items;
}

function mapActiveFooterLinks(
  links: LeanClinicSettings["footerLinks"],
  group: (typeof FOOTER_LINK_GROUPS)[keyof typeof FOOTER_LINK_GROUPS],
): FooterLinkItem[] {
  return links
    .filter((link) => link.isActive && link.group === group)
    .sort(
      (a, b) =>
        a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
    )
    .map((link) => ({ label: link.label, href: link.url }));
}

export type PublicFooterData = {
  contact: FooterContactInfo;
  social: FooterSocialItem[];
  quickLinks: FooterLinkItem[];
  serviceLinks: FooterLinkItem[];
  copyrightOwner: string;
};

/**
 * Build Footer props from ClinicSettings (single fetch at layout level).
 */
export function mapClinicSettingsToFooter(
  settings: LeanClinicSettings,
): PublicFooterData {
  const hasConfiguredLinks = settings.footerLinks.length > 0;
  const quickLinks = mapActiveFooterLinks(
    settings.footerLinks,
    FOOTER_LINK_GROUPS.QUICK_LINKS,
  );

  return {
    contact: mapClinicContact(settings),
    social: mapClinicSocialLinks(settings.socialLinks),
    quickLinks:
      quickLinks.length > 0 || hasConfiguredLinks
        ? quickLinks
        : [...DEFAULT_QUICK_LINKS],
    serviceLinks: mapActiveFooterLinks(
      settings.footerLinks,
      FOOTER_LINK_GROUPS.SERVICES,
    ),
    copyrightOwner: settings.clinicName,
  };
}

/**
 * Fetch clinic settings once per request for the public Footer / CTAs.
 * Wrapped in React `cache` so layout + pages share the same promise.
 * Falls back to null if the DB is unavailable (Footer uses built-in defaults).
 */
export const getPublicFooterData = cache(
  async (): Promise<PublicFooterData | null> => {
    try {
      const settings = await getOrCreateClinicSettings();
      return mapClinicSettingsToFooter(settings);
    } catch {
      return null;
    }
  },
);
