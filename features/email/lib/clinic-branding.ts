import "server-only";

import { ROUTES } from "@/constants/routes";
import { formatClinicAddress } from "@/features/clinic-settings/lib/format-clinic";
import type { ClinicEmailBranding } from "@/features/email/lib/branding-types";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";

export type { ClinicEmailBranding } from "@/features/email/lib/branding-types";

function getAppBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  return base && base.length > 0 ? base : "http://localhost:3000";
}

function toAbsoluteUrl(pathOrUrl: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseUrl}${path}`;
}

/**
 * Clinic branding for outbound emails — never hardcodes clinic identity.
 */
export async function getClinicEmailBranding(): Promise<ClinicEmailBranding> {
  const settings = await getOrCreateClinicSettings();
  const baseUrl = getAppBaseUrl();
  const logoPath = settings.logoUrl?.trim() || "/images/logo-navbar.png";

  return {
    clinicName: settings.clinicName,
    logoUrl: toAbsoluteUrl(logoPath, baseUrl),
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
  return getAppBaseUrl();
}
