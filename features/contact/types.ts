import type { Weekday } from "@/constants/scheduling";

/** Serializable contact details for the public /contact page. */
export type PublicContactInfo = {
  clinicName: string;
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
  emergencyContact: string | null;
  emergencyContactHref: string | null;
  googleMapsUrl: string | null;
  mapsEmbedUrl: string | null;
};

export type PublicClinicSchedule = {
  workingDays: Weekday[];
  workingDaysLabel: string;
  openingTime: string;
  openingTimeLabel: string;
  closingTime: string;
  closingTimeLabel: string;
  summaryLabel: string;
};

export type PublicContactPageData = {
  contact: PublicContactInfo;
  schedule: PublicClinicSchedule;
};
