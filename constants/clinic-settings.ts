/**
 * Clinic settings / public footer configuration constants.
 */

export const FOOTER_LINK_GROUPS = {
  QUICK_LINKS: "quickLinks",
  SERVICES: "services",
} as const;

export type FooterLinkGroup =
  (typeof FOOTER_LINK_GROUPS)[keyof typeof FOOTER_LINK_GROUPS];

export const FOOTER_LINK_GROUP_VALUES = [
  FOOTER_LINK_GROUPS.QUICK_LINKS,
  FOOTER_LINK_GROUPS.SERVICES,
] as const;

export const FOOTER_LINK_GROUP_LABELS: Record<FooterLinkGroup, string> = {
  quickLinks: "Quick Links",
  services: "Services",
};

export const SOCIAL_LINK_KEYS = [
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
] as const;

export type SocialLinkKey = (typeof SOCIAL_LINK_KEYS)[number];

export const SOCIAL_LINK_LABELS: Record<SocialLinkKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};
