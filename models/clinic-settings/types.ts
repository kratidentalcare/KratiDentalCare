import type { Model, Types } from "mongoose";

import type {
  AppointmentDurationMinutes,
  Weekday,
} from "@/constants/scheduling";
import type {
  LeanSoftActivatableDocument,
  SoftActivatableDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Recurring daily break window (clinic-local HH:mm).
 */
export type ClinicBreakWindow = {
  startTime: string;
  endTime: string;
  label: string | null;
};

/**
 * Booking policy knobs consulted by future patient booking.
 */
export type ClinicBookingRules = {
  minLeadTimeHours: number;
  maxAdvanceDays: number;
  cancellationCutoffHours: number;
  allowSameDayBooking: boolean;
};

/**
 * Embedded clinic address (same shape as patient address).
 */
export type ClinicAddress = {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

/** Optional public social profile URLs (https only). */
export type ClinicSocialLinks = {
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
};

export type FooterLinkGroup = "quickLinks" | "services";

/** Configurable public footer navigation entry. */
export type ClinicFooterLink = {
  label: string;
  url: string;
  group: FooterLinkGroup;
  displayOrder: number;
  isActive: boolean;
};

/**
 * Operational clinic settings singleton (v1: clinicKey = "primary").
 *
 * @see docs/04-database-design.md §E
 */
export type ClinicSettingsFields = {
  clinicKey: string;
  clinicName: string;
  address: ClinicAddress;
  phone: string;
  /** Optional secondary clinic phone. */
  secondaryPhone: string | null;
  email: string;
  /** Optional emergency contact phone for public display. */
  emergencyContact: string | null;
  /** Optional Google Maps place / directions URL. */
  googleMapsUrl: string | null;
  logoUrl: string | null;
  socialLinks: ClinicSocialLinks;
  footerLinks: ClinicFooterLink[];
  timezone: string;
  workingDays: Weekday[];
  /** Clinic-local opening time `HH:mm` (24h). */
  openingTime: string;
  /** Clinic-local closing time `HH:mm` (24h). */
  closingTime: string;
  /** Default bookable appointment length in minutes. */
  appointmentDurationMinutes: AppointmentDurationMinutes;
  breaks: ClinicBreakWindow[];
  bookingRules: ClinicBookingRules;
  /** Default doctor for public booking when patients do not choose one. */
  defaultDoctorId: Types.ObjectId | null;
  updatedByUserId: Types.ObjectId | null;
};

export type ClinicSettingsDocument = SoftActivatableDocument &
  ClinicSettingsFields;

export type LeanClinicSettings = LeanSoftActivatableDocument &
  ClinicSettingsFields;

export type ClinicSettingsModel = Model<
  ClinicSettingsDocument,
  SoftDeleteQueryHelpers
>;
