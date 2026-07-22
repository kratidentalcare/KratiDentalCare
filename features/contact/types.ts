import type { Weekday } from "@/constants/scheduling";
import type { ContactMessageStatus } from "@/constants/statuses";
import type { PaginationMeta } from "@/types/api";

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

/** Admin Inbox list-row / detail DTO. */
export type ContactMessageListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  /** Derived: `status === NEW`. */
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageListResult = {
  items: ContactMessageListItem[];
  pagination: PaginationMeta & {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
