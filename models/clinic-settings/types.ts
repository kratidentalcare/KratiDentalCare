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
  email: string;
  logoUrl: string | null;
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
