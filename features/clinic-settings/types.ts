import type { Weekday } from "@/constants/scheduling";
import type {
  ClinicFooterLink,
  ClinicSocialLinks,
  LeanClinicSettings,
} from "@/models/clinic-settings";

/** Serializable settings snapshot for the Clinic Settings dashboard. */
export type ClinicSettingsView = {
  clinicName: string;
  phone: string;
  secondaryPhone: string | null;
  email: string;
  emergencyContact: string | null;
  googleMapsUrl: string | null;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  socialLinks: ClinicSocialLinks;
  footerLinks: ClinicFooterLink[];
  timezone: string;
  workingDays: Weekday[];
  openingTime: string;
  closingTime: string;
  appointmentDurationMinutes: number;
  defaultDoctorId: string | null;
};

export function toClinicSettingsView(
  settings: LeanClinicSettings,
): ClinicSettingsView {
  return {
    clinicName: settings.clinicName,
    phone: settings.phone,
    secondaryPhone: settings.secondaryPhone,
    email: settings.email,
    emergencyContact: settings.emergencyContact,
    googleMapsUrl: settings.googleMapsUrl,
    address: {
      line1: settings.address.line1,
      line2: settings.address.line2,
      city: settings.address.city,
      state: settings.address.state,
      postalCode: settings.address.postalCode,
      country: settings.address.country,
    },
    socialLinks: {
      facebook: settings.socialLinks.facebook,
      instagram: settings.socialLinks.instagram,
      linkedin: settings.socialLinks.linkedin,
      youtube: settings.socialLinks.youtube,
    },
    footerLinks: settings.footerLinks.map((link) => ({
      label: link.label,
      url: link.url,
      group: link.group,
      displayOrder: link.displayOrder,
      isActive: link.isActive,
    })),
    timezone: settings.timezone,
    workingDays: [...settings.workingDays],
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    appointmentDurationMinutes: settings.appointmentDurationMinutes,
    defaultDoctorId: settings.defaultDoctorId
      ? String(settings.defaultDoctorId)
      : null,
  };
}
