import "server-only";

import { ROUTES } from "@/constants/routes";
import { formatClinicAddress } from "@/features/clinic-settings/lib/format-clinic";
import {
  resolveEmailAppBaseUrl,
  toAbsoluteEmailUrl,
} from "@/features/email/lib/app-base-url";
import type { ClinicEmailBranding } from "@/features/email/lib/branding-types";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";

export type { ClinicEmailBranding } from "@/features/email/lib/branding-types";

/**
 * Clinic branding for outbound emails — never hardcodes clinic identity.
 */
export async function getClinicEmailBranding(): Promise<ClinicEmailBranding> {
  const settings = await getOrCreateClinicSettings();
  const baseUrl = resolveEmailAppBaseUrl();
  const logoPath = settings.logoUrl?.trim() || "/images/logo-navbar.png";

  return {
    clinicName: settings.clinicName,
    logoUrl: toAbsoluteEmailUrl(logoPath, baseUrl),
    address: formatClinicAddress(settings.address),
    phone: settings.phone,
    email: settings.email,
    websiteUrl: baseUrl,
    contactUrl: `${baseUrl}${ROUTES.PUBLIC.CONTACT}`,
    bookUrl: `${baseUrl}${ROUTES.PUBLIC.BOOK}`,
    socialLinks: {
      facebook: settings.socialLinks.facebook,
      instagram: settings.socialLinks.instagram,
      twitter: settings.socialLinks.twitter,
      youtube: settings.socialLinks.youtube,
    },
  };
}

export function getAppBaseUrlForEmail(): string {
  return resolveEmailAppBaseUrl();
}
