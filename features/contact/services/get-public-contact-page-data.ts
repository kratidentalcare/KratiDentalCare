import "server-only";

import { cache } from "react";

import {
  formatClinicAddress,
  formatClinicTime12h,
  formatClinicWorkingDaysLabel,
  formatClinicWorkingHours,
  toTelHref,
} from "@/features/clinic-settings/lib/format-clinic";
import { toGoogleMapsEmbedUrl } from "@/features/contact/lib/maps-embed";
import type { PublicContactPageData } from "@/features/contact/types";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";

/**
 * Build public /contact page props from ClinicSettings (identity + schedule).
 * Cached per request so layout-adjacent fetches stay deduped.
 */
export const getPublicContactPageData = cache(
  async (): Promise<PublicContactPageData | null> => {
    try {
      const settings = await getOrCreateClinicSettings();
      const emergency = settings.emergencyContact?.trim() || null;
      const googleMapsUrl = settings.googleMapsUrl?.trim() || null;

      return {
        contact: {
          clinicName: settings.clinicName,
          address: formatClinicAddress(settings.address),
          phone: settings.phone,
          phoneHref: toTelHref(settings.phone),
          email: settings.email,
          emergencyContact: emergency,
          emergencyContactHref: emergency ? toTelHref(emergency) : null,
          googleMapsUrl,
          mapsEmbedUrl: toGoogleMapsEmbedUrl(googleMapsUrl),
        },
        schedule: {
          workingDays: [...settings.workingDays],
          workingDaysLabel: formatClinicWorkingDaysLabel(settings.workingDays),
          openingTime: settings.openingTime,
          openingTimeLabel: formatClinicTime12h(settings.openingTime),
          closingTime: settings.closingTime,
          closingTimeLabel: formatClinicTime12h(settings.closingTime),
          summaryLabel: formatClinicWorkingHours(settings),
        },
      };
    } catch {
      return null;
    }
  },
);
