/**
 * Clinic branding DTO for outbound emails (shared by templates + branding loader).
 */
export type ClinicEmailBranding = {
  clinicName: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  websiteUrl: string;
  contactUrl: string;
  bookUrl: string;
  socialLinks: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
  };
};
